import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logger } from "@/lib/logger";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorBoundary } from "@/instrumentation";

function BuggyComponent() {
  throw new Error("I am a render error!");
}

export default function ErrorTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [shouldThrowInNested, setShouldThrowInNested] = useState(false);
  const { handleError } = useErrorHandler();

  const triggerAsyncError = () => {
    setTimeout(() => {
      throw new Error("I am an async error from setTimeout!");
    }, 100);
  };

  const triggerUnhandledRejection = () => {
    Promise.reject(new Error("I am an unhandled promise rejection!"));
  };

  const triggerManualLog = () => {
    Logger.logError(new Error("Manual error log"), "Test Context");
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold font-mono">Error Handling Test Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Global Render Error (ErrorBoundary at Root)</CardTitle>
          <CardDescription>
            This will trigger the `componentDidCatch` in the global ErrorBoundary, replacing the whole page content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shouldThrow ? (
            <BuggyComponent />
          ) : (
            <Button variant="destructive" onClick={() => setShouldThrow(true)}>
              Trigger Page Render Error
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nested Render Error (Local ErrorBoundary)</CardTitle>
          <CardDescription>
            This triggers a local ErrorBoundary, keeping the rest of the page functional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorBoundary>
            {shouldThrowInNested ? (
              <BuggyComponent />
            ) : (
              <Button variant="destructive" onClick={() => setShouldThrowInNested(true)}>
                Trigger Nested Render Error
              </Button>
            )}
          </ErrorBoundary>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Async Error (window.onerror)</CardTitle>
          <CardDescription>
            This will trigger the global `error` listener.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={triggerAsyncError}>
            Trigger Async Error
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unhandled Rejection (window.onunhandledrejection)</CardTitle>
          <CardDescription>
            This will trigger the global `unhandledrejection` listener.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={triggerUnhandledRejection}>
            Trigger Promise Rejection
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Logger Call</CardTitle>
          <CardDescription>
            Manually call the Logger service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={triggerManualLog}>
              Log Manual Error
            </Button>
            <Button variant="outline" onClick={() => handleError(new Error("Hook error!"), "Hook Context")}>
              Test useErrorHandler Hook
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Button variant="ghost" onClick={() => window.location.href = "/dashboard"}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
