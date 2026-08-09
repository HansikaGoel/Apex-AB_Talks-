import { z } from "zod";

export const COMP_NAME = "MyComp";

export const CompositionProps = z.object({
  title: z.string(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  title: "The Interview Agent",
};

// 3.5 minutes presentation = 210 seconds * 30 fps = 6300 frames
export const VIDEO_FPS = 30;
export const DURATION_IN_FRAMES = 6300; 
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
