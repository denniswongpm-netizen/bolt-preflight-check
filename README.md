# bolt-preflight-check

A small demo built after applying for StackBlitz's Staff PM role on Bolt.new, aimed at Bolt.new's
own most-cited failure mode: AI-generated code that **looks right but calls something that was
never actually defined** — reviewers report Bolt burning up to half a user's tokens re-writing
files to fix bugs it introduced itself, often exactly this shape of bug.

## Why a "looks right" check has to actually run the code

JavaScript doesn't statically flag a call to an undefined function the way a typed language's
compiler would — `capitalize(name)` parses perfectly fine even if `capitalize` was never defined
anywhere. It only throws a real `ReferenceError` the moment that code path actually **executes**.
So the only reliable way to catch this bug class before a user hits it is to actually run the
generated code against a few real invocations, not just read it and assume it's fine.

## Run it

No dependencies — Node's built-in `vm` and `node:test` only:

```bash
npm run demo:good     # a clean generated module — passes
npm run demo:broken   # the exact injected bug this repo exists to catch — fails loudly
npm test              # 6 tests, including the injected-bug case
```

Real output from `demo:broken`:

```
❌ fixtures/broken-greeting-module.js FAILED preflight:
  [smoke_test] A smoke-test call failed against the loaded module: ReferenceError: capitalize is not defined
```

## How it works

- **`lib/sandbox.js`** — runs a string of JS in a fresh `vm` context with a minimal set of globals
  (`module`, `exports`, `console`).
- **`lib/checker.js`** — loads the generated module into the sandbox, then runs a small set of real
  smoke-test calls against its exported API in the *same* context, catching whatever actually
  breaks and reporting exactly which stage failed (`load` vs. `smoke_test`) and why — never a bare
  pass/fail with no detail.
- **`fixtures/`** — a clean module and a broken one (a helper function that reads like it exists
  but was never written), plus the shared smoke-test calls run against both.

## Honest limitations

- **This is not a real security sandbox.** Node's own `vm` docs are explicit that it does not
  isolate untrusted code from the host process. This demo only ever runs code we wrote ourselves —
  a production version of this idea would need real process isolation, not `vm` alone.
- **It only catches bugs that a smoke test actually exercises.** A function nobody calls in the
  smoke-test set can still hide the exact same bug. This is a preflight sanity check, not a
  substitute for real test coverage or a full static analyzer.

## Where this pattern comes from

Same underlying discipline as a second demo I built for a different application
([transcript-copilot](https://github.com/denniswongpm-netizen/tactiq-transcript-copilot)): a
generated artifact's claims aren't trusted because they read correctly — they're independently
re-checked against reality, and the check reports exactly what it found, not just true/false. I
used the same principle building an AI-orchestrated platform end-to-end, where every generated
artifact runs through a comparable check before a human ever reviews it. This repo is that same
idea, pointed at Bolt.new's own domain instead.

— Dennis Wong
[linkedin.com/in/denniswongpm](https://linkedin.com/in/denniswongpm)
