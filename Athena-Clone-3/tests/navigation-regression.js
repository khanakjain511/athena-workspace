export function checkWorkspaceNavigation(root) {
  const buttons = [...root.querySelectorAll('[data-slot="hook-sidebar"] button')]
  const expected = ['Setup', 'Assessment', 'Results']
  const checks = [
    { name: 'Three native navigation buttons', pass: buttons.length === 3 },
    { name: 'All destinations have visible labels', pass: expected.every((label) => buttons.some((button) => button.textContent.trim() === label)) },
    { name: 'One active destination is announced', pass: buttons.filter((button) => button.getAttribute('aria-current') === 'page').length === 1 },
    { name: 'Navigation uses button semantics', pass: buttons.length === 3 && buttons.every((button) => button.type === 'button') },
  ]
  return { pass: checks.every((check) => check.pass), checks }
}
