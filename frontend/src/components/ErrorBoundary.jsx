import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props){ super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error){ return { hasError:true, error }; }
  componentDidCatch(error, info){ console.error("UI error:", error, info); }
  render(){
    if (this.state.hasError) {
      return <div style={{padding:"1rem"}}>Something went wrong. Check console.</div>;
    }
    return this.props.children;
  }
}
