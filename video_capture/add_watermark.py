from moviepy import VideoFileClip, ImageClip, CompositeVideoClip


def add_image_watermark(
    input_path: str,
    watermark_path: str,
    output_path: str,
    pos: str = "right-bottom",  # "right-bottom", "right-top", "left-bottom", "left-top", or ("x","y")
    margin: int = 24,  # margem em pixels das bordas
    opacity: float = 0.6,  # 0.0 a 1.0
    rel_width: float = 0.2,  # largura da marca em relação ao vídeo (20%)
    codec: str = "libx264",
    crf: int = 20,  # qualidade (menor = melhor)
    preset: str = "medium",
):
    video = VideoFileClip(input_path)
    wmark = (
        ImageClip(watermark_path)
        .resized(width=int(video.w * rel_width))
        .with_duration(video.duration)
        .with_opacity(opacity)
    )

    # posicionamento
    if isinstance(pos, tuple):
        position = pos
    else:
        x_right = lambda clip: video.w - clip.w - margin
        x_left = lambda clip: margin
        y_bottom = lambda clip: video.h - clip.h - margin
        y_top = lambda clip: margin
        map_pos = {
            "right-bottom": lambda clip: (x_right(clip), y_bottom(clip)),
            "right-top": lambda clip: (x_right(clip), y_top(clip)),
            "left-bottom": lambda clip: (x_left(clip), y_bottom(clip)),
            "left-top": lambda clip: (x_left(clip), y_top(clip)),
        }
        position = map_pos.get(pos, map_pos["right-bottom"])

    out = CompositeVideoClip([video, wmark])
    out.write_videofile(
        output_path,
        codec=codec,
        audio_codec="aac",
        preset=preset,
        bitrate=None,  # deixe o CRF controlar a qualidade
        ffmpeg_params=["-crf", str(crf)],
    )


# uso:
add_image_watermark(
    "/home/oendel/code/grava_nois/video_capture/highlight_20250817-152246.mp4",
    "/home/oendel/code/grava_nois/video_capture/files/grava-nois.png",
    "output.mp4",
)
