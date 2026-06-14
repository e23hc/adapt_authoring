// Side-effect module: registers the built-in component renderers. Imported by the entry point.
import { registerComponent } from "./registry";
import { Text } from "./components/Text";
import { Graphic } from "./components/Graphic";
import { Media } from "./components/Media";
import { Mcq } from "./components/Mcq";
import { Accordion } from "./components/Accordion";

registerComponent("text", Text);
registerComponent("graphic", Graphic);
registerComponent("media", Media);
registerComponent("mcq", Mcq);
registerComponent("accordion", Accordion);
