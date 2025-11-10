import { alfredMenuItemsSchema } from './schemas/alfred-menu-item';

try {
  // Generate dynamic menu items based on query
  const menuItems = alfredMenuItemsSchema.parse({
    items: [
      {
        uid: 'sample-1',
        title: 'Sample menu item...',
        subtitle: 'Sample menu item',
        arg: 'Sample',
        autocomplete: 'Sample',
      },
    ],
  });

  // Output JSON for Alfred
  console.log(JSON.stringify(menuItems, null, 2));
} catch (error) {
  // Output error in Alfred-compatible format
  console.log(
    JSON.stringify({
      items: [
        {
          uid: 'error',
          title: 'Error',
          subtitle: error instanceof Error ? error.message : 'Unknown error',
          valid: false,
        },
      ],
    }),
  );
  process.exit(1);
}
