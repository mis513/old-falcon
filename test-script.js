async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbxUbmxIAh7K3nRoma8WZ-H4GkOieTzsS6eJei2-NpSrW1yj6R3H69Cu7CXC9N1IIz0y2w/exec';
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ targetSheet: 'Vendor Details', 'VENDOR NAME': 'ABC_TEST_3' })
  });
  console.log(res.status, res.statusText);
  const text = await res.text();
  console.log(text.substring(0, 500));
}
test();
