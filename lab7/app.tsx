import { useEffect, useState } from 'react';
import BookCard from './book.tsx';

function App() {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const fallbackData = [
        { id: 1, title: "Три товарища", authors: ["Эрих Мария Ремарк"], isbn: "9785170941391" },
        { id: 2, title: "Мастер и Маргарита", authors: ["Михаил Булгаков"], isbn: "9785170878857" },
        { id: 3, title: "Портрет Дориана Грея", authors: ["Оскар Уайльд"], isbn: "9785170878376" }
      ];

      try {
        const res = await fetch('https://fakeapi.extendsclass.com/books');
        if (!res.ok) throw new Error();
        const data = await res.json();
        await processInQueue(data.slice(0, 9));
      } catch {
        await processInQueue(fallbackData);
      }
    };

    const processInQueue = async (data: any[]) => {
      const results: any[] = [];
      for (const book of data) {
        let blob: Blob | null = null;
        try {
          const imgUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`;
          const imgRes = await fetch(imgUrl);
          if (imgRes.ok) {
            blob = await imgRes.blob();
          }
        } catch (e) {
          console.error(e);
        }
        results.push({ ...book, imageBlob: blob });
        setBooks([...results]);
        await new Promise(r => setTimeout(r, 300));
      }
    };

    loadData();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '30px', 
      padding: '40px', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {books.map(book => (
        <BookCard 
          key={book.id} 
          title={book.title} 
          authors={book.authors} 
          imageBlob={book.imageBlob} 
        />
      ))}
    </div>
  );
}

export default App;