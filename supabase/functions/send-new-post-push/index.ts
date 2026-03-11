import admin from "npm:firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: Deno.env.get("FIREBASE_PROJECT_ID"),
    clientEmail: Deno.env.get("FIREBASE_CLIENT_EMAIL"),
    privateKey: Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
  }),
});

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { title, body } = await req.json();

  const { data: tokens } = await supabase
    .from("tokens")
    .select("token");

  const promises = tokens.map(({fcm_token}) =>
    admin.messaging()
      .send({
      token: fcm_token,
      notification: { title, body },
    })
    .then((messageId) => ({
      token: fcm_token,
      success: true,
      message: messageId,
    }))
    .catch((error) => ({
      token: fcm_token,
      success: false,
      error: error.message,
    }))
  );

  const results = await Promise.all(promises);

  return new Response(
    JSON.stringify({results}),
    { 
      status: 200,
      headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", 
      },
    }
  );
};
