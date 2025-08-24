import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props){ super(props); this.state = { hasError:false, error:null, info:null }; }
  static getDerivedStateFromError(error){ return { hasError:true, error }; }
  componentDidCatch(error, info){ console.error("UI error:", error, info); this.setState({ info }); }
  render(){
    if (this.state.hasError) {
      return (
        <div style={{padding:"1rem"}}>
          <h3>UI crashed</h3>
          <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.error?.message || this.state.error || "Unknown error")}</pre>
          {this.state.error?.stack && <details open><summary>Stack</summary><pre style={{whiteSpace:"pre-wrap"}}>{this.state.error.stack}</pre></details>}
          {this.state.info?.componentStack && <details open><summary>Component stack</summary><pre style={{whiteSpace:"pre-wrap"}}>{this.state.info.componentStack}</pre></details>}
        </div>
      );
    }
    return this.props.children;
  }
}
