import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { QuestionAttachment } from '../types/quiz';

interface AudioPlayerProps {
  attachment: QuestionAttachment;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ attachment }) => {
  // Placeholder for audio player
  // In real implementation, use Expo AV or react-native-sound
  return (
    <View className="p-4 bg-blue-50 rounded-lg">
      <Text className="text-sm text-gray-600 mb-2">Listen to the audio:</Text>
      <TouchableOpacity className="bg-blue-500 py-2 px-4 rounded">
        <Text className="text-white text-center">Play Audio</Text>
      </TouchableOpacity>
      <Text className="text-xs text-gray-500 mt-2">
        Audio URL: {attachment.mediaUrl}
      </Text>
    </View>
  );
};

export default AudioPlayer;
