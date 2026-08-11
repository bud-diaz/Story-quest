import { Button } from '@/ui/components/shared/Button';

interface StartScreenProps {
  hasSave: boolean;
  onNewGame: () => void;
  onContinue: () => void;
}

export function StartScreen({ hasSave, onNewGame, onContinue }: StartScreenProps) {
  return (
    <div className="start-screen">
      <h1>StoryQuest</h1>
      <p className="start-screen__tagline">Help Benny the Beaver fix the forest bridge!</p>
      <div className="start-screen__actions">
        {hasSave && <Button onClick={onContinue}>Continue</Button>}
        <Button variant={hasSave ? 'secondary' : 'primary'} onClick={onNewGame}>
          New Game
        </Button>
      </div>
    </div>
  );
}
