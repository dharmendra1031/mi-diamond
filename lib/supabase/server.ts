import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { execute, query } from "@/lib/mssql";

const SESSION_COOKIE = "mi_session";

const tableDefinitions = {
  products: {
    sql: "[dbo].[products]",
    columns: [
      "id", "slug", "name", "description", "category_id", "price", "old_price",
      "currency", "images", "metal", "stone", "carat", "ring_size", "is_published",
      "is_featured", "stock_status", "sku", "stock", "weight_grams", "created_at", "updated_at",
    ],
    json: ["images"],
  },
  categories: {
    sql: "[dbo].[categories]",
    columns: ["id", "slug", "name", "description", "sort_order", "created_at"],
    json: [],
  },
  profiles: {
    sql: "[dbo].[profiles]",
    columns: ["id", "full_name", "phone", "is_admin", "created_at", "updated_at"],
    json: [],
  },
  orders: {
    sql: "[dbo].[orders]",
    columns: [
      "id", "order_number", "user_id", "customer_name", "customer_phone", "customer_email",
      "address_line", "city", "district", "postal_code", "items", "subtotal", "total",
      "currency", "customer_note", "admin_note", "status", "payment_status", "payment_method",
      "payment_id", "created_at", "updated_at",
    ],
    json: ["items"],
  },
  newsletter_subscribers: {
    sql: "[dbo].[newsletter_subscribers]",
    columns: ["id", "email", "is_active", "source", "created_at"],
    json: [],
  },
  site_assets: {
    sql: "[dbo].[site_assets]",
    columns: ["key", "label", "image_url", "storage_path", "created_at", "updated_at"],
    json: [],
  },
} as const;

type TableName = keyof typeof tableDefinitions;
type Filter =
  | { type: "eq" | "neq" | "gte" | "lte" | "gt" | "lt" | "ilike"; column: string; value: unknown }
  | { type: "is" | "not-is"; column: string; value: null }
  | { type: "in"; column: string; value: unknown[] }
  | { type: "or"; value: string };

type QueryResult<T = any> = {
  data: T | null;
  error: { message: string } | null;
  count?: number | null;
};

function tableInfo(table: string) {
  if (!(table in tableDefinitions)) throw new Error(`Unsupported table: ${table}`);
  return tableDefinitions[table as TableName];
}

function safeColumn(table: string, column: string) {
  const info = tableInfo(table);
  if (!(info.columns as readonly string[]).includes(column)) {
    throw new Error(`Unsupported column ${column} on ${table}`);
  }
  return `[${column}]`;
}

function serializeValue(table: string, column: string, value: unknown) {
  const info = tableInfo(table);
  if ((info.json as readonly string[]).includes(column) && value != null && typeof value !== "string") {
    return JSON.stringify(value);
  }
  return value;
}

function normalizeRow(table: string, row: Record<string, any>) {
  const info = tableInfo(table);
  const next: Record<string, any> = { ...row };

  for (const column of info.json as readonly string[]) {
    if (typeof next[column] === "string") {
      try {
        next[column] = JSON.parse(next[column]);
      } catch {
        next[column] = [];
      }
    }
    if (next[column] == null) next[column] = [];
  }

  for (const [key, value] of Object.entries(next)) {
    if (value instanceof Date) next[key] = value.toISOString();
  }

  if ("__rel_category_id" in next) {
    next.categories = next.__rel_category_id
      ? {
          id: next.__rel_category_id,
          slug: next.__rel_category_slug,
          name: next.__rel_category_name,
        }
      : null;
    delete next.__rel_category_id;
    delete next.__rel_category_slug;
    delete next.__rel_category_name;
  }

  if ("__product_count" in next) {
    next.products = [{ count: Number(next.__product_count ?? 0) }];
    delete next.__product_count;
  }

  return next;
}

function errorResult(error: unknown): QueryResult {
  return {
    data: null,
    error: { message: error instanceof Error ? error.message : "Database operation failed." },
  };
}

class MssqlQueryBuilder {
  private operation: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private selected = "*";
  private selectOptions: { count?: string; head?: boolean } | undefined;
  private payload: Record<string, unknown> | null = null;
  private filters: Filter[] = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private rangeValue: { from: number; to: number } | null = null;
  private conflictColumn = "id";

  constructor(private table: string) {
    tableInfo(table);
  }

  select(columns = "*", options?: { count?: string; head?: boolean }) {
    this.selected = columns;
    this.selectOptions = options;
    if (this.operation === "select") this.operation = "select";
    return this;
  }

  insert(payload: Record<string, unknown>) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Record<string, unknown>) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  upsert(payload: Record<string, unknown>, options?: { onConflict?: string }) {
    this.operation = "upsert";
    this.payload = payload;
    this.conflictColumn = options?.onConflict || "id";
    return this;
  }

  eq(column: string, value: unknown) {
    safeColumn(this.table, column);
    this.filters.push({ type: "eq", column, value });
    return this;
  }

  neq(column: string, value: unknown) {
    safeColumn(this.table, column);
    this.filters.push({ type: "neq", column, value });
    return this;
  }

  gte(column: string, value: unknown) {
    safeColumn(this.table, column);
    this.filters.push({ type: "gte", column, value });
    return this;
  }

  lte(column: string, value: unknown) {
    safeColumn(this.table, column);
    this.filters.push({ type: "lte", column, value });
    return this;
  }

  gt(column: string, value: unknown) {
    safeColumn(this.table, column);
    this.filters.push({ type: "gt", column, value });
    return this;
  }

  lt(column: string, value: unknown) {
    safeColumn(this.table, column);
    this.filters.push({ type: "lt", column, value });
    return this;
  }

  ilike(column: string, value: unknown) {
    safeColumn(this.table, column);
    this.filters.push({ type: "ilike", column, value });
    return this;
  }

  is(column: string, value: null) {
    safeColumn(this.table, column);
    this.filters.push({ type: "is", column, value });
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    safeColumn(this.table, column);
    if (operator === "is" && value === null) {
      this.filters.push({ type: "not-is", column, value: null });
      return this;
    }
    throw new Error(`Unsupported not() operator: ${operator}`);
  }

  in(column: string, values: unknown[]) {
    safeColumn(this.table, column);
    this.filters.push({ type: "in", column, value: values });
    return this;
  }

  or(expression: string) {
    this.filters.push({ type: "or", value: expression });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    safeColumn(this.table, column);
    this.orderBy = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.rangeValue = { from, to };
    return this;
  }

  async single<T = any>(): Promise<QueryResult<T>> {
    const result = await this.run();
    const rows = Array.isArray(result.data) ? result.data : [];
    if (result.error) return result as QueryResult<T>;
    if (rows.length !== 1) {
      return { data: null, error: { message: `Expected one row, received ${rows.length}.` } };
    }
    return { ...result, data: rows[0] as T };
  }

  async maybeSingle<T = any>(): Promise<QueryResult<T>> {
    const result = await this.run();
    const rows = Array.isArray(result.data) ? result.data : [];
    if (result.error) return result as QueryResult<T>;
    if (rows.length > 1) {
      return { data: null, error: { message: `Expected zero or one row, received ${rows.length}.` } };
    }
    return { ...result, data: (rows[0] ?? null) as T | null };
  }

  then<TResult1 = QueryResult<any[]>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<any[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.run().then(onfulfilled, onrejected);
  }

  private buildWhere(params: Record<string, unknown>) {
    if (this.filters.length === 0) return "";
    const clauses: string[] = [];
    let index = 0;

    for (const filter of this.filters) {
      if (filter.type === "or") {
        const parts = filter.value.split(",").map((part) => part.trim()).filter(Boolean);
        const orParts: string[] = [];
        for (const part of parts) {
          const match = part.match(/^([a-zA-Z0-9_]+)\.ilike\.(.*)$/);
          if (!match) continue;
          const [, column, rawValue] = match;
          safeColumn(this.table, column);
          const param = `p${index++}`;
          params[param] = rawValue;
          orParts.push(`t.${safeColumn(this.table, column)} LIKE @${param}`);
        }
        if (orParts.length) clauses.push(`(${orParts.join(" OR ")})`);
        continue;
      }

      const column = `t.${safeColumn(this.table, filter.column)}`;
      if (filter.type === "is") {
        clauses.push(`${column} IS NULL`);
        continue;
      }
      if (filter.type === "not-is") {
        clauses.push(`${column} IS NOT NULL`);
        continue;
      }
      if (filter.type === "in") {
        if (filter.value.length === 0) {
          clauses.push("1 = 0");
          continue;
        }
        const names = filter.value.map((value) => {
          const param = `p${index++}`;
          params[param] = serializeValue(this.table, filter.column, value);
          return `@${param}`;
        });
        clauses.push(`${column} IN (${names.join(", ")})`);
        continue;
      }

      const param = `p${index++}`;
      params[param] = serializeValue(this.table, filter.column, filter.value);
      const operator = {
        eq: "=",
        neq: "<>",
        gte: ">=",
        lte: "<=",
        gt: ">",
        lt: "<",
        ilike: "LIKE",
      }[filter.type];
      clauses.push(`${column} ${operator} @${param}`);
    }

    return clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  }

  private async run(): Promise<QueryResult<any[]>> {
    try {
      const info = tableInfo(this.table);
      const params: Record<string, unknown> = {};
      const where = this.buildWhere(params);

      if (this.operation === "select") {
        if (this.selectOptions?.count === "exact" && this.selectOptions?.head) {
          const rows = await query<{ count: number }>(
            `SELECT COUNT_BIG(*) AS [count] FROM ${info.sql} t${where};`,
            params,
          );
          return { data: [], error: null, count: Number(rows[0]?.count ?? 0) };
        }

        const wantsCategory = this.table === "products" && this.selected.includes("categories(");
        const wantsProductCount = this.table === "categories" && this.selected.includes("products(count)");
        const extras: string[] = [];
        let join = "";

        if (wantsCategory) {
          extras.push(
            "c.[id] AS [__rel_category_id]",
            "c.[slug] AS [__rel_category_slug]",
            "c.[name] AS [__rel_category_name]",
          );
          join = " LEFT JOIN [dbo].[categories] c ON c.[id] = t.[category_id]";
        }
        if (wantsProductCount) {
          extras.push(
            "(SELECT COUNT_BIG(*) FROM [dbo].[products] p WHERE p.[category_id] = t.[id]) AS [__product_count]",
          );
        }

        const selectList = `t.*${extras.length ? `, ${extras.join(", ")}` : ""}`;
        let paging = "";
        let top = "";
        let order = this.orderBy
          ? ` ORDER BY t.${safeColumn(this.table, this.orderBy.column)} ${this.orderBy.ascending ? "ASC" : "DESC"}`
          : "";

        if (this.rangeValue) {
          if (!order) order = " ORDER BY t.[id] ASC";
          const count = this.rangeValue.to - this.rangeValue.from + 1;
          paging = ` OFFSET ${Math.max(0, this.rangeValue.from)} ROWS FETCH NEXT ${Math.max(0, count)} ROWS ONLY`;
        } else if (this.limitCount != null) {
          top = `TOP (${Math.max(0, this.limitCount)}) `;
        }

        const rows = await query<Record<string, any>>(
          `SELECT ${top}${selectList} FROM ${info.sql} t${join}${where}${order}${paging};`,
          params,
        );
        return { data: rows.map((row) => normalizeRow(this.table, row)), error: null };
      }

      if (this.operation === "insert") {
        if (!this.payload) throw new Error("Insert payload is required.");
        const entries = Object.entries(this.payload).filter(([column]) =>
          (info.columns as readonly string[]).includes(column),
        );
        if (!entries.length) throw new Error("Insert payload has no supported columns.");

        const columns = entries.map(([column]) => safeColumn(this.table, column)).join(", ");
        const values = entries.map(([column, value], index) => {
          const param = `v${index}`;
          params[param] = serializeValue(this.table, column, value);
          return `@${param}`;
        });
        const rows = await query<Record<string, any>>(
          `INSERT INTO ${info.sql} (${columns}) OUTPUT INSERTED.* VALUES (${values.join(", ")});`,
          params,
        );
        return { data: rows.map((row) => normalizeRow(this.table, row)), error: null };
      }

      if (this.operation === "update") {
        if (!this.payload) throw new Error("Update payload is required.");
        const entries = Object.entries(this.payload).filter(([column]) =>
          (info.columns as readonly string[]).includes(column),
        );
        if (!entries.length) return { data: [], error: null };

        const sets = entries.map(([column, value], index) => {
          const param = `v${index}`;
          params[param] = serializeValue(this.table, column, value);
          return `${safeColumn(this.table, column)} = @${param}`;
        });
        if ((info.columns as readonly string[]).includes("updated_at") && !this.payload.updated_at) {
          sets.push("[updated_at] = SYSUTCDATETIME()");
        }
        const rows = await query<Record<string, any>>(
          `UPDATE t SET ${sets.join(", ")} OUTPUT INSERTED.* FROM ${info.sql} t${where};`,
          params,
        );
        return { data: rows.map((row) => normalizeRow(this.table, row)), error: null };
      }

      if (this.operation === "delete") {
        const rows = await query<Record<string, any>>(
          `DELETE t OUTPUT DELETED.* FROM ${info.sql} t${where};`,
          params,
        );
        return { data: rows.map((row) => normalizeRow(this.table, row)), error: null };
      }

      if (this.operation === "upsert") {
        if (!this.payload) throw new Error("Upsert payload is required.");
        safeColumn(this.table, this.conflictColumn);
        const conflictValue = this.payload[this.conflictColumn];
        if (conflictValue == null) throw new Error(`Upsert requires ${this.conflictColumn}.`);

        const existing = await new MssqlQueryBuilder(this.table)
          .select("*")
          .eq(this.conflictColumn, conflictValue)
          .maybeSingle();

        if (existing.data) {
          return await new MssqlQueryBuilder(this.table)
            .update(this.payload)
            .eq(this.conflictColumn, conflictValue)
            .run();
        }
        return await new MssqlQueryBuilder(this.table).insert(this.payload).run();
      }

      return { data: [], error: null };
    } catch (error) {
      return errorResult(error) as QueryResult<any[]>;
    }
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await query<Record<string, any>>(
    `SELECT TOP (1)
       u.[id], u.[email], p.[full_name], p.[phone], p.[is_admin]
     FROM [dbo].[sessions] s
     INNER JOIN [dbo].[users] u ON u.[id] = s.[user_id]
     LEFT JOIN [dbo].[profiles] p ON p.[id] = u.[id]
     WHERE s.[token_hash] = @token_hash AND s.[expires_at] > SYSUTCDATETIME();`,
    { token_hash: hashToken(token) },
  );

  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email),
    user_metadata: {
      full_name: row.full_name ?? null,
      phone: row.phone ?? null,
      is_admin: Boolean(row.is_admin),
    },
  };
}

export async function createClient() {
  return {
    from(table: string) {
      return new MssqlQueryBuilder(table);
    },
    auth: {
      async getUser() {
        try {
          return { data: { user: await getSessionUser() }, error: null };
        } catch (error) {
          return { data: { user: null }, error: errorResult(error).error };
        }
      },
      async signOut() {
        try {
          const cookieStore = await cookies();
          const token = cookieStore.get(SESSION_COOKIE)?.value;
          if (token) {
            await execute(
              "DELETE FROM [dbo].[sessions] WHERE [token_hash] = @token_hash;",
              { token_hash: hashToken(token) },
            );
          }
          cookieStore.delete(SESSION_COOKIE);
          return { error: null };
        } catch (error) {
          return { error: errorResult(error).error };
        }
      },
    },
  };
}
