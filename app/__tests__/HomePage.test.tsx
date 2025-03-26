import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import "@testing-library/jest-dom";

describe("HomePage", () => {
  it("renders the title and description", () => {
    render(<HomePage />);
    
    expect(screen.getByText("Rules")).toBeInTheDocument();
    expect(screen.getByText("Game Modes")).toBeInTheDocument();
    expect(screen.getByText("Scoring System")).toBeInTheDocument();
    expect(
      screen.getByText("Your ultimate map-based challenge game! Start playing now and test your geography skills.")
    ).toBeInTheDocument();
  });

  it("renders the play button", () => {
    render(<HomePage />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders the animated dots text", () => {
    render(<HomePage />);
    expect(screen.getByText(/Let’s play/)).toBeInTheDocument();
  });
});
