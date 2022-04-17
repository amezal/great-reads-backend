import axios from 'axios';

const deleteProps = (obj, prop) => {
  for (const p of prop) {
    (p in obj) && (delete obj[p]);
  }
}

export const getAuthor = async (req, res) => {
  const url = `https://openlibrary.org/authors/${req.params.id}`

  const { data: author } = await axios.get(url + '.json');

  author.photo = author.photos ? author.photos[0] : '-1';

  deleteProps(author, ['remote_ids', 'links', 'personal_name', 'birth_date',
    'created', 'last_modified', 'source_records', 'type', 'revision',
    'latest_revision', 'photos', 'alternate_names', 'entity_type',
    'title', 'wikipedia', 'website'])

  const { data: works } = await axios.get(url + '/works.json?limit=0');

  author.works = works.size;

  if (author.bio) {
    if (author.bio.value) {
      author.bio = author.bio.value;
    }
  } else {
    author.bio = 'No description available'
  }

  res.send(author);

}

export const getAuthorBooks = async (req, res) => {
  const url = `https://openlibrary.org/authors/${req.params.id}`
  const page = req.query.page - 1 || 0;
  const { data: books } = await axios.get(url + `/works.json?offset=${page * 15}&limit=15`);
  delete books.links

  books.entries.forEach(book => {
    book.cover = book.covers ? book.covers[0] : '-1';
    deleteProps(book, ['authors', 'type', 'revision', 'latest_revision',
      'created', 'last_modified', 'description', 'subjects', 'links',
      'subject_people', 'subject_places', 'excerpts', 'covers', 'first_publish_date'])
  })
  res.send(books);
}