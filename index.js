export default {
  async fetch(request, env) {
    return await handleRequest(request).catch(
      (err) => new Response(err.stack, { status: 500 })
    );
  }
};

async function handleRequest(request) {
  const { pathname } = new URL(request.url);

  if (pathname.startsWith("/api")) {
    // Handle displaying a list of items
    const data = await fetch("https://api.github.com/users/mralexgray/repos");
    const items = await data.json();
    
    // Return a JSON response with the list of items
    return new Response(JSON.stringify(items), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (pathname.startsWith("/item")) {
    // Extract item ID from the path
    const itemId = pathname.split("/")[2];

    // Fetch details for a specific item based on its ID
    const itemData = await fetch(`hhttps://api.github.com/repositories/${itemId}`);
    const itemDetails = await itemData.json();

    // Return a JSON response with the item details
    return new Response(JSON.stringify(itemDetails), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response("Invalid endpoint for this API.");
}
