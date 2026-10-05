import fetch from 'node-fetch';

async function test() {
  const form = new FormData();
  form.append('key', '6d207e02198a847aa98d0a2a901485a5');
  form.append('action', 'upload');
  form.append('source', 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
  form.append('format', 'json');

  try {
    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: form
    });
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}
test();
