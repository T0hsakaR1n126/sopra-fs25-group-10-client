import "@testing-library/jest-dom"; // Adds matchers like toBeInTheDocument()
import { jest } from "@jest/globals";

if (typeof global.window !== "undefined") {
    global.window.matchMedia = global.window.matchMedia || function () {
        return {
            matches: false,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        };
    };
}
