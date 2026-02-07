import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotificationProvider, useNotification } from "./NotificationContext";

function TypesTestComponent() {
  const notification = useNotification();

  return (
    <div>
      <span data-testid="defined">{notification ? "yes" : "no"}</span>
      <span data-testid="has-show">
        {typeof notification.showNotification === "function" ? "yes" : "no"}
      </span>
    </div>
  );
}

describe("NotificationContext types", () => {
  it("provides context object", () => {
    render(
      <NotificationProvider>
        <TypesTestComponent />
      </NotificationProvider>,
    );

    expect(screen.getByTestId("defined")).toHaveTextContent("yes");
  });

  it("provides showNotification function", () => {
    render(
      <NotificationProvider>
        <TypesTestComponent />
      </NotificationProvider>,
    );

    expect(screen.getByTestId("has-show")).toHaveTextContent("yes");
  });
});
