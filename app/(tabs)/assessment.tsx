
import React from 'react';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { YBOCSAssessment } from '@/components/assessment/YBOCSAssessment';

export default function AssessmentScreen() {
  return (
    <ScreenLayout scrollable={false}>
      <YBOCSAssessment />
    </ScreenLayout>
  );
}
