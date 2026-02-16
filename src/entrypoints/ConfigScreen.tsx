import type { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Canvas, ContextInspector } from "datocms-react-ui";

type Props = {
  ctx: RenderConfigScreenCtx;
};

export default function ConfigScreen({ ctx }: Props) {
  return (
    <Canvas ctx={ctx}>
      <p>Welcome to your plugin! This is your config screen!</p>
      <div>
        <ContextInspector />
      </div>
    </Canvas>
  );
}
