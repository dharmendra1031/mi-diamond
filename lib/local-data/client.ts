type ApiError = { message: string } | null;

async function postJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok && !payload.error) {
    payload.error = { message: `Request failed (${response.status}).` };
  }
  return payload;
}

class BrowserDataBuilder implements PromiseLike<{ data: any; error: ApiError }> {
  private operation: "insert" | "update" | "upsert" = "insert";
  private payload: Record<string, unknown> = {};
  private filters: Array<{ column: string; value: unknown }> = [];
  private conflict: string | undefined;

  constructor(private table: string) {}

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

  upsert(payload: Record<string, unknown>, options?: { onConflict?: string }) {
    this.operation = "upsert";
    this.payload = payload;
    this.conflict = options?.onConflict;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  private run() {
    return postJson("/api/data", {
      table: this.table,
      operation: this.operation,
      payload: this.payload,
      filters: this.filters,
      conflict: this.conflict,
    });
  }

  then<TResult1 = { data: any; error: ApiError }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: ApiError }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

function storageBucket(bucket: string) {
  return {
    async upload(
      path: string,
      file: File,
      options?: { contentType?: string; upsert?: boolean },
    ) {
      const body = new FormData();
      body.set("bucket", bucket);
      body.set("path", path);
      body.set("file", file);
      body.set("upsert", options?.upsert ? "1" : "0");
      if (options?.contentType) body.set("contentType", options.contentType);

      const response = await fetch("/api/upload", { method: "POST", body });
      const payload = await response.json().catch(() => ({}));
      return {
        data: payload.data ?? null,
        error: response.ok ? null : payload.error ?? { message: "Upload failed." },
      };
    },
    getPublicUrl(path: string) {
      const clean = path.split("/").map(encodeURIComponent).join("/");
      return { data: { publicUrl: `/uploads/${encodeURIComponent(bucket)}/${clean}` } };
    },
    async remove(paths: string[]) {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bucket, paths }),
      });
      const payload = await response.json().catch(() => ({}));
      return {
        data: payload.data ?? null,
        error: response.ok ? null : payload.error ?? { message: "Delete failed." },
      };
    },
  };
}

export function createClient() {
  return {
    from(table: string) {
      return new BrowserDataBuilder(table);
    },
    storage: {
      from(bucket: string) {
        return storageBucket(bucket);
      },
    },
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        return postJson("/api/auth", { action: "login", email, password });
      },
      async signUp({
        email,
        password,
        options,
      }: {
        email: string;
        password: string;
        options?: { data?: { full_name?: string; phone?: string } };
      }) {
        return postJson("/api/auth", {
          action: "register",
          email,
          password,
          full_name: options?.data?.full_name,
          phone: options?.data?.phone,
        });
      },
      async signOut() {
        return postJson("/api/auth", { action: "logout" });
      },
      async resetPasswordForEmail(email: string, _options?: { redirectTo?: string }) {
        return postJson("/api/auth", { action: "forgot-password", email });
      },
      async updateUser({ password }: { password: string }) {
        return postJson("/api/auth", { action: "update-password", password });
      },
    },
  };
}
