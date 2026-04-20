/* eslint-disable no-console */
const backendBase = process.env.BACKEND_URL || "http://localhost:5000/api";
const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_SEED_EMAIL || "admin@hamrobichar.com";
const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_SEED_PASSWORD || "Admin@12345";

const requireJson = async (response) => {
  const text = await response.text();
  let parsed;

  try {
    parsed = text ? JSON.parse(text) : {};
  } catch (_err) {
    throw new Error(`Invalid JSON response (${response.status}): ${text}`);
  }

  if (!response.ok) {
    const message = parsed?.message || `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return parsed;
};

const createTinyPngBlob = () => {
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5hRxsAAAAASUVORK5CYII=";
  const buffer = Buffer.from(pngBase64, "base64");
  return new Blob([buffer], { type: "image/png" });
};

const run = async () => {
  const started = Date.now();
  console.log(`Smoke test starting against: ${backendBase}`);

  const healthRes = await fetch(`${backendBase}/health`);
  const health = await requireJson(healthRes);
  if (!health.success) {
    throw new Error("Health endpoint returned unsuccessful response");
  }

  const loginRes = await fetch(`${backendBase}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword
    })
  });
  const login = await requireJson(loginRes);
  const token = login?.data?.token;
  if (!token) {
    throw new Error("Login did not return token");
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`
  };

  const usersRes = await fetch(`${backendBase}/auth/users`, {
    method: "GET",
    headers: authHeaders
  });
  const users = await requireJson(usersRes);
  const userCount = Array.isArray(users.data) ? users.data.length : 0;

  const form = new FormData();
  form.append("image", createTinyPngBlob(), "smoke.png");

  const uploadRes = await fetch(`${backendBase}/upload/image`, {
    method: "POST",
    headers: authHeaders,
    body: form
  });
  const uploaded = await requireJson(uploadRes);
  const imageUrl = uploaded?.data?.imageUrl;
  if (!imageUrl) {
    throw new Error("Upload did not return imageUrl");
  }

  const stamp = Date.now();
  const createPayload = {
    title: `Smoke Test Article ${stamp}`,
    content: "<p>Smoke test create content.</p>",
    category: "SmokeTest",
    image: imageUrl.startsWith("http")
      ? imageUrl
      : `${backendBase.replace(/\/api\/?$/, "")}${imageUrl}`
  };

  const createRes = await fetch(`${backendBase}/articles`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(createPayload)
  });
  const created = await requireJson(createRes);
  const articleId = created?.data?._id;
  const articleSlug = created?.data?.slug;

  if (!articleId || !articleSlug) {
    throw new Error("Create article did not return _id and slug");
  }

  const listRes = await fetch(`${backendBase}/articles`);
  const list = await requireJson(listRes);
  const listCount = Array.isArray(list?.data?.articles) ? list.data.articles.length : 0;

  const bySlugRes = await fetch(`${backendBase}/articles/${articleSlug}`);
  const bySlug = await requireJson(bySlugRes);

  const updateRes = await fetch(`${backendBase}/articles/${articleId}`, {
    method: "PUT",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: `${createPayload.title} Updated`,
      content: "<p>Smoke test updated content.</p>",
      category: "SmokeTestUpdated"
    })
  });
  const updated = await requireJson(updateRes);

  const deleteRes = await fetch(`${backendBase}/articles/${articleId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  const deleted = await requireJson(deleteRes);

  const elapsedMs = Date.now() - started;

  console.log(
    JSON.stringify(
      {
        success: true,
        checks: {
          health: health.message,
          loginUser: login?.data?.user?.email,
          userCount,
          uploadImageUrl: imageUrl,
          createdId: articleId,
          createdSlug: articleSlug,
          listCount,
          fetchedBySlugTitle: bySlug?.data?.title,
          updatedTitle: updated?.data?.title,
          deleteMessage: deleted?.message
        },
        elapsedMs
      },
      null,
      2
    )
  );
};

run().catch((error) => {
  console.error(
    JSON.stringify(
      {
        success: false,
        message: error?.message || "Smoke test failed"
      },
      null,
      2
    )
  );
  process.exit(1);
});
