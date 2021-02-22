module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["WIP", "feat", "fix", "merge", "docs", "test", "chore", "refactor", "style", "perf", "revert"],
    ],
    "type-case": [0],
    "type-empty": [0],
    "scope-empty": [0, "never"],
    "scope-case": [0],
    "subject-full-stop": [0, "never"],
    "subject-case": [0, "never"],
    "header-max-length": [0, "always", 72],
  }
};
