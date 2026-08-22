async function pollCi() {
  const runId = '16643265886';
  for (let i = 0; i < 40; i++) {
    const res = await fetch('https://api.github.com/repos/hntt2510/nemThangLong/actions/runs/' + runId, {
      headers: { 'User-Agent': 'node' }
    });
    const data = await res.json();
    console.log(`[Attempt ${i + 1}] status: ${data.status}, conclusion: ${data.conclusion}`);
    if (data.status === 'completed') {
      if (data.conclusion !== 'success') {
        console.error('CI failed:', data.conclusion);
        process.exit(1);
      }
      console.log('CI passed successfully on exact commit d8c57d83d737919af6796171cd8553adc50f1f9b!');
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, 6000));
  }
  console.error('CI timed out');
  process.exit(1);
}

pollCi().catch((err) => {
  console.error(err);
  process.exit(1);
});
