import {AnimationObject} from 'lottie-react-native';

export interface OnboardingData {
  id: number;
  animation: AnimationObject;
  text: string;
  subtext: string;
  textColor: string;
  backgroundColor: string;
}

const data: OnboardingData[] = [
  {
    id: 1,
    animation: require('../../assets/onboarding/animations/Lottie13.json'),
    text: 'Team Management Made Easy',
    subtext:
      'Empower your team to excel with seamless collaboration and productivity tools.',
    textColor: 'white',
    backgroundColor: '#FFB84C',
  },
  {
    id: 2,
    animation: require('../../assets/onboarding/animations/Lottie2.json'),
    text: 'Achieve Balance & Productivity',
    subtext: 'Find the perfect work-life balance while boosting productivity.',
    textColor: 'white',
    backgroundColor: '#FF6B6B',
  },
  {
    id: 3,
    animation: require('../../assets/onboarding/animations/Lottie11.json'),
    text: 'Master Meeting Schedules',
    subtext:
      "Master the art of effective meeting scheduling, collaboration, and follow-up actions for your team's success.",
    textColor: 'white',
    backgroundColor: '#FF8551',
  },
];

export default data;
