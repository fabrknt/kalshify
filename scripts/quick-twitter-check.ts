/**
 * Quick check of Twitter handles using simple HTTP requests
 */

const handles = [
  { handle: 'blockscoutcom', company: 'Blockscout Base' },
  { handle: 'concentric_fi', company: 'Concentric' },
  { handle: 'FlashTrade_', company: 'Flash Trade' },
  { handle: 'goldskycom', company: 'Goldsky' },
  { handle: 'ironforge_cloud', company: 'Ironforge' },
  { handle: 'lagrangedev', company: 'Lagrange' },
  { handle: 'lobby_so', company: 'Lobby' },
  { handle: 'MeteoraAG', company: 'Meteora' },
  { handle: 'openfortxyz', company: 'Openfort' },
  { handle: 'peapods_finance', company: 'Peapods Finance' },
  { handle: 'Swaap_Finance', company: 'Swaap' },
  { handle: 'voltius_io', company: 'Voltius' },
  { handle: 'zeeve_io', company: 'Zeeve' }
];

async function checkHandle(handle: string): Promise<{ status: number; exists: boolean }> {
  try {
    const response = await fetch(`https://twitter.com/${handle}`, {
      method: 'HEAD',
      redirect: 'follow'
    });

    return {
      status: response.status,
      exists: response.status === 200
    };
  } catch (error) {
    return { status: 0, exists: false };
  }
}

async function main() {
  console.log("🔍 Quick Twitter Handle Check\n");

  const results = [];

  for (const { handle, company } of handles) {
    const result = await checkHandle(handle);
    results.push({ handle, company, ...result });

    const emoji = result.exists ? '✅' : '❌';
    console.log(`${emoji} @${handle.padEnd(20)} (${company.padEnd(25)}) - HTTP ${result.status}`);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("\n" + "=".repeat(80));
  const notFound = results.filter(r => !r.exists);
  const found = results.filter(r => r.exists);

  console.log(`\n✅ FOUND: ${found.length}`);
  found.forEach(r => console.log(`  - @${r.handle} (${r.company})`));

  console.log(`\n❌ NOT FOUND: ${notFound.length}`);
  notFound.forEach(r => console.log(`  - @${r.handle} (${r.company})`));

  console.log("\n" + "=".repeat(80));
}

main();
