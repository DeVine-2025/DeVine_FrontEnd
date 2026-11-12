import MyPMTopSection from '@components/myProject/MyPMTopSection';
import MatchingView from '../matching-view';

export default function MyPMPage() {
  return (
    <MatchingView role="pm">
      <MyPMTopSection />
    </MatchingView>
  );
}
