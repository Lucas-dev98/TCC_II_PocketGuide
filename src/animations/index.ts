/**
 * Animações Premium - Sistema de animações reutilizáveis
 * Autor: GitHub Copilot
 * Data: 22 de outubro de 2025
 */

import { Animated, Easing } from 'react-native';
import { animations } from '../theme';

// ============================================================================
// ANIMAÇÕES DE PÁGINA
// ============================================================================

/**
 * Fade In - Aparecimento suave
 */
export const createFadeInAnimation = (duration = animations.normal) => {
  const opacity = new Animated.Value(0);

  const animate = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return { opacity, animate };
};

/**
 * Fade Out - Desaparecimento suave
 */
export const createFadeOutAnimation = (duration = animations.normal) => {
  const opacity = new Animated.Value(1);

  const animate = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return { opacity, animate };
};

/**
 * Slide Up - Entrada de baixo para cima (Modal)
 */
export const createSlideUpAnimation = (duration = animations.normal) => {
  const translateY = new Animated.Value(300);
  const opacity = new Animated.Value(0);

  const animate = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration * 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    translateY,
    opacity,
    animate,
  };
};

/**
 * Slide Down - Saída para baixo (Modal)
 */
export const createSlideDownAnimation = (duration = animations.normal) => {
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(1);

  const animate = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 300,
        duration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: duration * 0.6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    translateY,
    opacity,
    animate,
  };
};

/**
 * Scale Fade - Zoom com fade (Item appear)
 */
export const createScaleFadeAnimation = (duration = animations.normal) => {
  const scale = new Animated.Value(0.95);
  const opacity = new Animated.Value(0);

  const animate = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    scale,
    opacity,
    animate,
  };
};

/**
 * Rotate - Rotação contínua (Loading)
 */
export const createRotateAnimation = (duration = 2000) => {
  const rotation = new Animated.Value(0);

  Animated.loop(
    Animated.timing(rotation, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return {
    rotation,
    rotateInterpolate,
  };
};

/**
 * Pulse - Pulso de opacidade (Ênfase)
 */
export const createPulseAnimation = (duration = 2000) => {
  const opacity = new Animated.Value(1);

  Animated.loop(
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start();

  return { opacity };
};

/**
 * Bounce - Efeito de pulo
 */
export const createBounceAnimation = (duration = animations.normal) => {
  const translateY = new Animated.Value(0);

  const animate = () => {
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: -20,
        duration: duration * 0.5,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: duration * 0.5,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { translateY, animate };
};

// ============================================================================
// ANIMAÇÕES DE LISTA (Staggered)
// ============================================================================

/**
 * Stagger Animation - Para itens de lista
 */
export const createStaggeredListAnimation = (itemCount: number, duration = animations.normal) => {
  const animations_array = Array.from({ length: itemCount }, () => ({
    scale: new Animated.Value(0.95),
    opacity: new Animated.Value(0),
  }));

  const animate = () => {
    const staggerDelay = duration / (itemCount * 2);

    animations_array.forEach((item, index) => {
      Animated.parallel([
        Animated.spring(item.scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
        }),
        Animated.timing(item.opacity, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true,
          delay: index * staggerDelay,
        }),
      ]).start();
    });
  };

  return {
    animations: animations_array,
    animate,
  };
};

// ============================================================================
// EASING PRESETS
// ============================================================================

export const easingPresets = {
  smooth: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  sharp: Easing.bezier(0.4, 0, 0.6, 1),
  elastic: Easing.elastic(1),
  bounce: Easing.bounce,
  back: Easing.back(1.52),
};

// ============================================================================
// UTILS
// ============================================================================

/**
 * Criar animação sequencial
 */
export const createSequenceAnimation = (animations_list: any[]) => {
  return () => {
    Animated.sequence(animations_list).start();
  };
};

/**
 * Criar animação paralela
 */
export const createParallelAnimation = (animations_list: any[]) => {
  return () => {
    Animated.parallel(animations_list).start();
  };
};
