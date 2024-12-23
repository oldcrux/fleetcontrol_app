// app/env/page.js

export default function EnvPage() {
  // Define the public environment variables you want to display
  const publicEnv = {
    NEXT_PUBLIC_GOOGLE_MAP_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    NEXT_PUBLIC_NODE_SERVER_URL: process.env.NEXT_PUBLIC_NODE_SERVER_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,

    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_CACHE_GLOBAL_TIMEOUT: process.env.REDIS_CACHE_GLOBAL_TIMEOUT,

    AUTH_MAX_AGE: process.env.AUTH_MAX_AGE,
    AUTH_UPDATE_AGE: process.env.AUTH_UPDATE_AGE,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };

  return (
    <div>
      <h1>Environment Variables</h1>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Variable Name
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(publicEnv).map(([key, value]) => (
            <tr key={key}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {key}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {value || "Not Set"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
