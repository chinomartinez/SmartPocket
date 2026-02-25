import CardItem from './CardItem';
import { financialCardData } from './mockData';

export default function FinancialCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
      {financialCardData.map((card, index) => (
        <CardItem 
          key={index}
          {...card}
        />
      ))}
    </div>
  );
}
