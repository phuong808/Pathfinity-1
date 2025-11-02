module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/app/db/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "account",
    ()=>account,
    "embedding",
    ()=>embedding,
    "session",
    ()=>session,
    "source",
    ()=>source,
    "user",
    ()=>user,
    "verification",
    ()=>verification
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/boolean.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/serial.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$vector_extension$2f$vector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/indexes.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/jsonb.js [app-route] (ecmascript)");
;
const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("users", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull(),
    email: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("email").notNull().unique(),
    emailVerified: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("email_verified"),
    image: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("image"),
    password: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("password"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
});
const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("sessions", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    expiresAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("expires_at").notNull(),
    token: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("token").notNull().unique(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull(),
    ipAddress: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("ip_address"),
    userAgent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("user_agent"),
    userId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("user_id").notNull().references(()=>user.id, {
        onDelete: "cascade"
    })
});
const account = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("accounts", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    userId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("user_id").notNull().references(()=>user.id, {
        onDelete: "cascade"
    }),
    accountId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("account_id").notNull(),
    providerId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("provider_id").notNull(),
    accessToken: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("access_token"),
    refreshToken: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("refresh_token"),
    accessTokenExpiresAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("access_token_expires_at"),
    refreshTokenExpiresAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("refresh_token_expires_at"),
    scope: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("scope"),
    idToken: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id_token"),
    password: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("password"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
});
const verification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("verifications", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    identifier: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("identifier").notNull(),
    value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("value").notNull(),
    expiresAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("expires_at").notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").notNull()
});
const source = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("sources", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull(),
    url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("url"),
    type: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("type").notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
});
const embedding = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("embeddings", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    sourceId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("source_id").notNull().references(()=>source.id, {
        onDelete: "cascade"
    }),
    refId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("ref_id"),
    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("title"),
    campus: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("campus"),
    courseCode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("course_code"),
    content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("content"),
    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("metadata"),
    contentHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("content_hash"),
    embedding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$vector_extension$2f$vector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["vector"])("embedding", {
        dimensions: 1536
    }),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").defaultNow().notNull()
}, (table)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("embedding_vector_idx").using("ivfflat", table.embedding.op("vector_cosine_ops"))
    ]);
}),
"[project]/app/db/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/serverless/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$neon$2d$http$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/neon-http/driver.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dotenv$2f$lib$2f$main$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dotenv/lib/main.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/db/schema.ts [app-route] (ecmascript)");
;
;
;
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dotenv$2f$lib$2f$main$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"])({
    path: '.env'
});
const sql = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["neon"])(process.env.DATABASE_URL);
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$neon$2d$http$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["drizzle"])(sql, {
    schema: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
});
}),
"[project]/lib/embeddings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Lightweight wrapper helpers for generating embeddings via OpenAI.
// - `generateEmbedding` creates a single embedding for a text string.
// - `generateEmbeddings` batches multiple inputs for faster ingestion.
// These helpers centralize model selection and minor input normalization.
__turbopack_context__.s([
    "generateEmbedding",
    ()=>generateEmbedding,
    "generateEmbeddings",
    ()=>generateEmbeddings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ai/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/openai/dist/index.mjs [app-route] (ecmascript)");
;
;
async function generateEmbedding(text) {
    const input = text.replace("\n", " ");
    const { embedding } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["embed"])({
        model: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["openai"].textEmbeddingModel('text-embedding-3-small'),
        value: input
    });
    return embedding;
}
async function generateEmbeddings(texts) {
    const inputs = texts.map((text)=>text.replace("\n", " "));
    const { embeddings } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["embedMany"])({
        model: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["openai"].textEmbeddingModel('text-embedding-3-small'),
        values: inputs
    });
    return embeddings;
}
}),
"[project]/lib/semantic-search.tsx [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/semantic-search.tsx
// Compute an embedding for the user query and perform a cosine-similarity
// lookup against the `embeddings` table using Drizzle ORM. Returns the top-N
// similar records (with similarity score and selected metadata) for RAG.
__turbopack_context__.s([
    "semanticSearch",
    ()=>semanticSearch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$functions$2f$vector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/functions/vector.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/expressions/select.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/expressions/conditions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/sql.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/embeddings.ts [app-route] (ecmascript)");
;
;
;
;
async function semanticSearch(query, limit = 5, threshold = 0.3) {
    const embedding = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateEmbedding"])(query);
    const similarity = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`1 - (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$functions$2f$vector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cosineDistance"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].embedding, embedding)})`;
    const similarEmbeddings = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].id,
        content: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].metadata,
        similarity,
        source: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["source"].name,
        source_id: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].refId,
        course_code: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].courseCode,
        title: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].title,
        campus: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].campus
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"]).leftJoin(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["source"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].sourceId} = ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["source"].id}`).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gt"])(similarity, threshold)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(similarity)).limit(limit);
    return similarEmbeddings;
}
}),
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Chat API route for the university course assistant.
// Defines tools used by the assistant:
// The file contains the system prompt and streaming response wiring.
__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ai/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$provider$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/provider-utils/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/openai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$semantic$2d$search$2e$tsx__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/semantic-search.tsx [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/sql.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
const tools = {
    getCourseByCode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$provider$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])({
        description: "Get detailed information about a specific course by its exact course code (e.g., 'Com 2163', 'COM 2158'). Use this when user mentions a specific course code.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            courseCode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("The exact course code (e.g., 'Com 2163')")
        }),
        execute: async ({ courseCode })=>{
            try {
                // Normalize the course code (remove extra spaces, make uppercase)
                const normalized = courseCode.trim().toUpperCase().replace(/\s+/g, ' ');
                const course = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
                    course_code: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].courseCode,
                    title: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].title,
                    campus: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].campus,
                    metadata: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].metadata
                }).from(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"]).where(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`UPPER(${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].courseCode}) = ${normalized}`).limit(1);
                if (!course || course.length === 0) {
                    return `Course ${courseCode} not found in the knowledge base. Please verify the course code or try searching with keywords.`;
                }
                const c = course[0];
                const metadata = c.metadata;
                const lines = [
                    `Course: ${c.course_code} - ${c.title}`
                ];
                if (c.campus) lines.push(`Campus/Department: ${c.campus}`);
                // Handle credits/units (check multiple fields)
                const units = metadata?.num_units || metadata?.units || metadata?.credits || metadata?.credit_hours;
                if (units !== undefined && units !== null && String(units).trim() !== '') {
                    lines.push(`Units/Credits: ${units}`);
                } else {
                    lines.push(`Units/Credits: Not specified`);
                }
                if (metadata?.course_desc) lines.push(`Description: ${metadata.course_desc}`);
                if (metadata?.metadata && String(metadata.metadata).trim()) {
                    lines.push(`Additional Info: ${metadata.metadata}`);
                }
                // Check for various prerequisite field names
                const prereqs = metadata?.prerequisites || metadata?.required_prep || metadata?.required_prereq;
                if (prereqs) lines.push(`Prerequisites: ${prereqs}`);
                // Add other metadata fields if available
                if (metadata?.dept_name) lines.push(`Department Name: ${metadata.dept_name}`);
                if (metadata?.inst_ipeds) lines.push(`Institution IPEDS: ${metadata.inst_ipeds}`);
                if (metadata?.course_prefix) lines.push(`Course Prefix: ${metadata.course_prefix}`);
                if (metadata?.course_number) lines.push(`Course Number: ${metadata.course_number}`);
                return lines.join('\n\n');
            } catch (error) {
                console.error('Get course error:', error);
                return 'Error retrieving course information. Please try again.';
            }
        }
    }),
    listCourses: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$provider$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])({
        description: "List courses from the knowledge base. Use when user wants to see all courses, browse courses, or list courses from a specific department/campus.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            department: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe("Filter by department name (e.g., 'Pacific Center for Advanced Technology Training')"),
            campus: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe("Filter by campus name"),
            limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional().default(20).describe("Maximum number of courses to return")
        }),
        execute: async ({ department, campus, limit = 20 })=>{
            try {
                // Build WHERE conditions
                const conditions = [];
                if (department) {
                    conditions.push(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].metadata}->>'dept_name' ILIKE ${`%${department}%`}`);
                }
                if (campus) {
                    conditions.push(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].campus} ILIKE ${`%${campus}%`}`);
                }
                const baseSelect = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
                    course_code: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].courseCode,
                    title: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].title,
                    campus: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].campus,
                    metadata: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].metadata
                }).from(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"]);
                // Apply WHERE conditions if present, then apply limit/orderBy on the final query.
                const finalQuery = conditions.length > 0 ? baseSelect.where(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].join(conditions, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]` AND `)}`).limit(limit).orderBy(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].courseCode) : baseSelect.limit(limit).orderBy(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedding"].courseCode);
                const courses = await finalQuery;
                if (!courses || courses.length === 0) {
                    return 'No courses found matching those criteria.';
                }
                const formattedResults = courses.map((course, index)=>{
                    const metadata = course.metadata;
                    const lines = [
                        `[${index + 1}] ${course.course_code} - ${course.title}`
                    ];
                    if (course.campus) lines.push(`   Campus/Department: ${course.campus}`);
                    // Handle credits/units with fallback
                    const units = metadata?.num_units || metadata?.units || metadata?.credits;
                    if (units !== undefined && units !== null && String(units).trim() !== '') {
                        lines.push(`   Units: ${units}`);
                    }
                    if (metadata?.course_desc) {
                        const desc = String(metadata.course_desc);
                        const truncated = desc.length > 200 ? desc.substring(0, 200) + '...' : desc;
                        lines.push(`   Description: ${truncated}`);
                    }
                    return lines.join('\n');
                }).join('\n\n');
                return formattedResults;
            } catch (error) {
                console.error('List courses error:', error);
                return 'Error retrieving course list. Please try again.';
            }
        }
    }),
    searchKnowledgeBase: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$provider$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])({
        description: "Search the course knowledge base for specific courses or topics. Use when user asks about specific course codes, prerequisites, topics, or detailed course information.",
        inputSchema: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            query: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe("The search query to find relevant information")
        }),
        execute: async ({ query })=>{
            try {
                const results = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$semantic$2d$search$2e$tsx__$5b$app$2d$route$5d$__$28$ecmascript$29$__["semanticSearch"])(query, 5, 0.3);
                if (!results || results.length === 0) {
                    return 'No relevant course information found. Try rephrasing your question or ask about a specific course code.';
                }
                const formattedResults = results.map((result, index)=>{
                    // Build header with source info
                    const headerParts = [
                        `[${index + 1}]`
                    ];
                    if (result.source) headerParts.push(result.source);
                    if (result.course_code) headerParts.push(result.course_code);
                    const header = headerParts.join(' | ');
                    const content = result.content;
                    // Helper function to extract fields from object
                    const pick = (obj, candidates)=>{
                        for (const k of candidates){
                            if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') {
                                return obj[k];
                            }
                        }
                        return undefined;
                    };
                    // Handle different content types
                    if (typeof content === 'string') {
                        return `${header}\n${content.trim()}`;
                    }
                    if (Array.isArray(content)) {
                        const body = content.map((c)=>typeof c === 'string' ? c : JSON.stringify(c)).join('\n');
                        return `${header}\n${body}`;
                    }
                    if (content && typeof content === 'object') {
                        // Extract course fields
                        const courseCode = pick(content, [
                            'course_code',
                            'course',
                            'courseId',
                            'course_num',
                            'course_number',
                            'code'
                        ]);
                        const coursePrefix = pick(content, [
                            'course_prefix'
                        ]);
                        const courseNumber = pick(content, [
                            'course_number'
                        ]);
                        const title = pick(content, [
                            'course_title',
                            'title',
                            'name'
                        ]);
                        const dept = pick(content, [
                            'dept_name',
                            'department',
                            'dept',
                            'division'
                        ]);
                        const units = pick(content, [
                            'num_units',
                            'units',
                            'credits',
                            'credit_hours'
                        ]);
                        const desc = pick(content, [
                            'course_desc',
                            'description',
                            'desc',
                            'summary',
                            'overview'
                        ]);
                        const metadata = pick(content, [
                            'metadata',
                            'additional_info',
                            'additional',
                            'notes'
                        ]);
                        const outcomes = pick(content, [
                            'learner_outcomes',
                            'outcomes',
                            'learning_outcomes'
                        ]);
                        const prereqs = pick(content, [
                            'prerequisites',
                            'required_prep',
                            'required_prereq',
                            'prereq'
                        ]);
                        const sectionNotes = pick(content, [
                            'section_notes',
                            'sectionNotes',
                            'section',
                            'section_note'
                        ]);
                        const lines = [];
                        // Course code line
                        const courseCodeParts = [];
                        if (courseCode) {
                            courseCodeParts.push(String(courseCode));
                        } else if (coursePrefix && courseNumber) {
                            courseCodeParts.push(`${coursePrefix} ${courseNumber}`);
                        }
                        if (title) courseCodeParts.push(String(title));
                        if (courseCodeParts.length) {
                            lines.push(`Course: ${courseCodeParts.join(' - ')}`);
                        }
                        // Other fields
                        if (dept) lines.push(`Department: ${String(dept)}`);
                        if (units !== undefined) lines.push(`Units: ${String(units)}`);
                        if (desc) lines.push(`Description: ${String(desc)}`);
                        if (metadata) lines.push(`Additional Info: ${String(metadata)}`);
                        // Handle outcomes (array or string)
                        if (Array.isArray(outcomes)) {
                            lines.push(`Learner Outcomes:\n${outcomes.map((o)=>`  • ${o}`).join('\n')}`);
                        } else if (outcomes) {
                            lines.push(`Learner Outcomes: ${String(outcomes)}`);
                        }
                        if (prereqs) lines.push(`Prerequisites: ${String(prereqs)}`);
                        if (sectionNotes) lines.push(`Section Notes: ${String(sectionNotes)}`);
                        // Fallback if no structured fields found
                        if (lines.length === 0) {
                            const fallback = pick(content, [
                                'text',
                                'content',
                                'snippet'
                            ]) || JSON.stringify(content, null, 2);
                            return `${header}\n${String(fallback)}`;
                        }
                        return `${header}\n${lines.join('\n')}`;
                    }
                    // Last resort: stringify
                    return `${header}\n${JSON.stringify(content)}`;
                }).join('\n\n');
                return formattedResults;
            } catch (error) {
                console.error('Search error:', error);
                return 'Error searching the course knowledge base. Please try again or refine your query.';
            }
        }
    })
};
async function POST(req) {
    try {
        const { messages } = await req.json();
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["streamText"])({
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["openai"])('gpt-4.1-mini'),
            messages: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["convertToModelMessages"])(messages),
            tools,
            system: `You are a helpful university course assistant with access to the course knowledge base.

HOW TO RESPOND:

For greetings and casual conversation:
- Respond naturally and briefly, then offer to help with courses
- Example: "Hello! I'm doing well, thank you. I'm here to help you find course information. What courses are you interested in?"

For specific course code lookups:
- Use getCourseByCode when user mentions a specific course code (e.g., "Com 2163", "tell me about COM 2158")
- This guarantees finding the course if it exists and returns ALL metadata fields
- Use for questions about specific fields: credits, IPEDS, department name, course prefix/number
- Example: "Com 2163", "what is COM 2158", "credits for Com 2187", "what is the IPEDS for Com 2036"

For listing/browsing courses:
- Use listCourses tool for requests like "list all courses", "show me courses", "what courses are available"
- Can filter by department or campus if user specifies
- Present results in a clear, organized way
- If many results, suggest being more specific
- IMPORTANT: Only call this tool ONCE per response - do not repeat calls

For specific course searches:
- Use searchKnowledgeBase for topic-based searches, not exact course codes
- Examples: "AWS courses", "courses about networking", "cybersecurity training"
- Always cite results with [1], [2], etc.

For course-related questions:
- Choose the appropriate tool based on the question type
- getCourseByCode: When user asks about a specific course code or its attributes
- listCourses: When user wants to browse or see multiple courses
- searchKnowledgeBase: When user searches by topic/keyword
- If results found: Answer concisely with citations when appropriate
- If no results: Explain you couldn't find that specific information and suggest alternatives

IMPORTANT RULES:
- When asked about credits/units for a course, use getCourseByCode to get complete info
- If credits are "Not specified", clearly state that
- For metadata fields (IPEDS, dept_name, etc.), use getCourseByCode
- Never call the same tool twice in one response
- Be conversational and helpful, not robotic

For non-course questions (sports, weather, celebrities, general facts):
- Politely decline and redirect to course information
- Example: "I can only help with course information from our catalog. I don't have access to information about sports teams or other topics. Is there a course or program I can help you find?"

RULES:
- Always use tools for course-related questions
- Choose the RIGHT tool: getCourseByCode for specific codes, listCourses for browsing, searchKnowledgeBase for topics
- NEVER call the same tool multiple times in one response
- Be conversational and helpful, not robotic
- Cite sources with [1], [2] when providing course information from searchKnowledgeBase
- Keep responses concise (2-5 sentences typically)
- Guide users toward more specific queries if their question is too broad
- When credits/units are not available, clearly state "Not specified" rather than saying you can't find the info`,
            stopWhen: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stepCountIs"])(2)
        });
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('Error streaming chat completion:', error);
        return new Response('Failed to stream chat completion', {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1e381105._.js.map