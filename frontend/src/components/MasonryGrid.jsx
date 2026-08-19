import PinCard from './PinCard'

function MasonryGrid({ images, onDelete }) {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 px-6 py-6 max-w-7xl mx-auto">
      {images.map((img) => (
        <div key={img.id} className="break-inside-avoid mb-6">
          <PinCard img={img} onDelete={onDelete} />
        </div>
      ))}
    </div>
  )
}

export default MasonryGrid