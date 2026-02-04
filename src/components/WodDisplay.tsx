import { Wod } from '@/types/wod';
import WodSectionCard from './WodSectionCard';

const FireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 12.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/><path d="M12 15s-5-2-5-7c0-2.5 2.5-5 5-5s5 2.5 5 5c0 5-5 7-5 7"/></svg>
);

const BarbellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6 12h12"/><path d="M6 12v-2a2 2 0 1 1 4 0v2"/><path d="M14 12v-2a2 2 0 1 1 4 0v2"/><path d="M6 12a2 2 0 0 0-4 3v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a2 2 0 0 0-4-3"/></svg>
);

const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3v7h6l-8 11v-7H5l8-11z"/></svg>
);

const HeartPulseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>
);

interface WodDisplayProps {
  wod: Wod;
}

const WodDisplay: React.FC<WodDisplayProps> = ({ wod }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-center items-center gap-4">
        <h2 className="text-4xl font-semibold text-center text-neutral-900 dark:text-neutral-100">
          {wod.title}
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WodSectionCard section={wod.warmUp} icon={<FireIcon />} />
        <WodSectionCard section={wod.strengthSkill} icon={<BarbellIcon />} />
        <div className="lg:col-span-2">
          <WodSectionCard section={wod.metcon} icon={<BoltIcon />} />
        </div>
        <div className="lg:col-span-2">
          <WodSectionCard section={wod.coolDown} icon={<HeartPulseIcon />} />
        </div>
      </div>
    </div>
  );
};

export default WodDisplay;
