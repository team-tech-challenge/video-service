const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	collectCoverage: true,
	coverageDirectory: 'coverage',
	collectCoverageFrom: [
	  "<rootDir>/src/**/*.ts",
	  "!<rootDir>/src/infrastructure/config/**/*.ts",
	  "!<rootDir>/src/main.ts"
	],
	coverageReporters: ['lcov', 'text'],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
	rootDir: ".",
  	modulePaths: [
		"<rootDir>/",
	],
  	testMatch: ["<rootDir>/tests/**/*.test.ts"], // Define onde estão os testes
  };
