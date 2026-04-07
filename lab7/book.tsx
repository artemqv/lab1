import { useEffect, useState } from "react";
interface BookCardProps {
  title: string;
  authors: string[];
  imageBlob: Blob | null;
}

const BookCard: React.FC<BookCardProps> = ({ title, authors, imageBlob }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (imageBlob) {
      const objectUrl = URL.createObjectURL(imageBlob);
      setImageUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [imageBlob]);

  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} style={styles.image} />
        ) : (
          <div style={styles.placeholder}>Загрузка обложки...</div>
        )}
      </div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.authors}>{authors.join(', ')}</p>
    </div>
  );
};

const styles = {
  card: {
    width: '220px',
    padding: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: '280px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const,
  },
  placeholder: { color: '#999', fontSize: '12px' },
  title: { 
    margin: '12px 0 4px 0',
    color: '#333'
  },
  authors: { 
    color: '#777',
    margin: 0
  }
};

export default BookCard;