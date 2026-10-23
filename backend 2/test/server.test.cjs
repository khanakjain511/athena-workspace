const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

test('a fresh installation can complete an assessment without existing sessions', { timeout: 15000 }, async () => {
  const project = path.resolve(__dirname, '..');
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'athena-api-'));
  let server;
  try {
    await fs.mkdir(path.join(directory, 'data'));
    await fs.copyFile(path.join(project, 'server.js'), path.join(directory, 'server.cjs'));
    await fs.copyFile(path.join(project, 'data/questions.json'), path.join(directory, 'data/questions.json'));
    await fs.symlink(path.join(project, 'node_modules'), path.join(directory, 'node_modules'), 'dir');
    server = spawn(process.execPath, [path.join(directory, 'server.cjs')], { env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let errors = '';
    server.stderr.on('data', (chunk) => { errors += chunk; });
    const baseUrl = await new Promise((resolve, reject) => {
      server.stdout.on('data', (chunk) => {
        const match = String(chunk).match(/http:\/\/localhost:\d+/);
        if (match) resolve(match[0]);
      });
      server.once('error', reject);
      server.once('exit', (code) => reject(new Error(`API exited with ${code}: ${errors}`)));
    });
    const post = (route, body) => fetch(`${baseUrl}${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const questions = await (await fetch(`${baseUrl}/exam/mcq`)).json();
    assert.ok(questions.length > 0);
    assert.ok(questions.every((question) => !Object.hasOwn(question, 'correctAnswer')));
    assert.equal((await post('/exam/start', {})).status, 400);
    const started = await post('/exam/start', { userId: 'test-candidate', name: 'Test Candidate' });
    assert.equal(started.status, 201);
    const { sessionId } = await started.json();
    const answer = { sessionId, questionId: questions[0].id, selectedAnswer: 0 };
    assert.equal((await post('/exam/answer', { ...answer, questionId: -1 })).status, 404);
    const saved = await post('/exam/answer', answer);
    assert.equal(saved.status, 200);
    assert.equal((await saved.json()).attempted, 1);
    assert.equal((await post('/exam/answer', answer)).status, 400);
    const submitted = await post('/exam/submit', { sessionId });
    assert.equal(submitted.status, 200);
    const { result } = await submitted.json();
    assert.equal(result.attempted, 1);
    assert.equal(result.correct + result.wrong, 1);
    assert.equal((await post('/exam/answer', { ...answer, questionId: questions[1].id })).status, 400);
    const sessions = JSON.parse(await fs.readFile(path.join(directory, 'data/sessions.json'), 'utf8'));
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].status, 'submitted');
  } finally {
    if (server && server.exitCode === null) {
      const exited = once(server, 'exit');
      server.kill();
      await exited;
    }
    await fs.rm(directory, { recursive: true, force: true });
  }
});
