/**
 * OnboardingQuiz - Gathers user preferences to tailor their experience
 * 3 quick questions: travel style, budget, travel companion
 */

import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { QuizAnswers } from "../types";

export const OnboardingQuiz: React.FC = () => {
  const { updateUserTags, loading } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});

  const questions = [
    {
      id: "travelStyle",
      question: "What's your travel style?",
      options: [
        { label: "🏃 Adventure", value: "aventura" },
        { label: "🧘 Relax", value: "relax" },
        { label: "🏛️ Culture", value: "cultura" },
        { label: "🍽️ Gastronomy", value: "gastronomia" },
      ],
    },
    {
      id: "budget",
      question: "What's your average daily budget?",
      options: [
        { label: "💰 Budget-friendly", value: "econômico" },
        { label: "💵 Mid-range", value: "médio" },
        { label: "💎 Luxury", value: "luxo" },
      ],
    },
    {
      id: "travelWith",
      question: "Who are you traveling with?",
      options: [
        { label: "🧑 Solo", value: "sozinho" },
        { label: "👫 Partner", value: "casal" },
        { label: "👨‍👩‍👧‍👦 Family", value: "família" },
        { label: "👯 Friends", value: "amigos" },
      ],
    },
  ];

  const question = questions[currentQuestion];

  const handleAnswerSelect = (value: string) => {
    setAnswers({
      ...answers,
      [question.id]: value,
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed - save tags
      handleQuizComplete(value);
    }
  };

  const handleQuizComplete = async (lastValue: string) => {
    const tags = [
      answers.travelStyle,
      answers.budget,
      lastValue, // Last answer for travel companion
    ].filter(Boolean) as string[];

    try {
      await updateUserTags(tags);
    } catch (error) {
      console.error("Error saving quiz answers:", error);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Let's personalize your experience</Text>
          <Text style={styles.subtitle}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progressPercentage}%` },
            ]}
          />
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{question.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                answers[question.id as keyof QuizAnswers] === option.value &&
                  styles.optionButtonSelected,
              ]}
              onPress={() => handleAnswerSelect(option.value)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.optionText,
                  answers[question.id as keyof QuizAnswers] === option.value &&
                    styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
            onPress={handleBack}
            disabled={currentQuestion === 0 || loading}
          >
            <Text
              style={[
                styles.navButtonText,
                currentQuestion === 0 && styles.navButtonTextDisabled,
              ]}
            >
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 32,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3B82F6",
  },
  questionContainer: {
    marginBottom: 32,
  },
  question: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1F2937",
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  optionButtonSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  optionText: {
    fontSize: 15,
    color: "#4B5563",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  navButtonTextDisabled: {
    color: "#D1D5DB",
  },
});
