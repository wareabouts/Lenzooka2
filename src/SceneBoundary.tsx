import { Component, type ReactNode } from "react";
export class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="scene-fallback">
          <strong>The 3D view could not start.</strong>
          <p>
            Your bench data is preserved. You can continue probing in the
            focused face below. Retry the scene, or enable hardware acceleration
            in Chrome and reload.
          </p>
          <button onClick={() => this.setState({ failed: false })}>
            Retry 3D view
          </button>
        </div>
      );
    return this.props.children;
  }
}
