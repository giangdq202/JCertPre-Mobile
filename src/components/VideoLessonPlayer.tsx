import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/Feather";

interface VideoLessonPlayerProps {
  courseId: string;
  lessonId: string;
  lessonTitle?: string;
  videoUrl: string;
}

export const VideoLessonPlayer: React.FC<VideoLessonPlayerProps> = ({
  lessonTitle,
  videoUrl,
}) => {
  const videoRef = useRef<Video>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(false);

  /** Cập nhật trạng thái video */
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setCurrentTime(status.positionMillis / 1000);
    setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);

    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  /** Play / Pause */
  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  /** Mute / Unmute */
  const toggleMute = async () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    await videoRef.current.setIsMutedAsync(newMuted);
    setIsMuted(newMuted);
  };

  /** Seek video */
  const handleSeek = async (value: number) => {
    if (!videoRef.current) return;
    await videoRef.current.setPositionAsync(value * 1000);
    setCurrentTime(value);
  };

  /** Volume */
  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    if (videoRef.current) {
      await videoRef.current.setVolumeAsync(value);
      setIsMuted(value === 0);
    }
  };

  /** Format mm:ss */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!videoUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không có video để hiển thị</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {lessonTitle && <Text style={styles.lessonTitle}>{lessonTitle}</Text>}

      {/* 🎬 Video Player */}
      <Video
        ref={videoRef}
        source={{
          uri: videoUrl ? videoUrl + ".mp4" : "",
          overrideFileExtensionAndroid: "mp4",
        }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls={false}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={(e) => {
          setLoading(false);
          console.log("❌ Video error:", JSON.stringify(e, null, 2));
          Alert.alert("Lỗi", "Không thể phát video.");
        }}
      />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Play / Pause */}
        <TouchableOpacity
          onPress={togglePlayPause}
          style={styles.controlButton}
        >
          <Icon name={isPlaying ? "pause" : "play"} size={28} color="#fff" />
        </TouchableOpacity>

        {/* Time */}
        <Text style={styles.time}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>

        {/* Seek Bar */}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#3b82f6"
          maximumTrackTintColor="#aaa"
          thumbTintColor="#3b82f6"
        />

        {/* Volume */}
        <View style={styles.volumeContainer}>
          <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
            <Icon
              name={isMuted ? "volume-x" : "volume-2"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onSlidingComplete={handleVolumeChange}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#aaa"
            thumbTintColor="#3b82f6"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    paddingBottom: 10,
  },
  lessonTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
  },
  video: {
    width: "100%",
    height: 220,
    backgroundColor: "#000",
  },
  controls: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
  },
  controlButton: {
    marginRight: 10,
  },
  time: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 5,
  },
  slider: {
    width: "100%",
    height: 30,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  volumeSlider: {
    flex: 1,
    height: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    alignItems: "center",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
  },
});
