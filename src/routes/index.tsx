import { createFileRoute } from "@tanstack/react-router";
import { PolarisApp } from "@/components/polaris/polaris-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <PolarisApp />;
}
