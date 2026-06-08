const { TestSystem } = require('./run');

async function run() {
  const sys = new TestSystem();
  await sys.initAdminAndUsers();
  
  if (sys.hosts.length === 0) {
    console.log("No hosts found");
    return;
  }
  const host = sys.hosts[0];
  const p = sys.provinces[0];
  const lm = p.landmarks[0];
  const payload = sys.generateListingPayload(p, lm);
  
  console.log("Payload:", JSON.stringify(payload, null, 2));
  const res = await host.createListing(payload);
  console.log("Result:", res);
}

run().catch(console.error);
