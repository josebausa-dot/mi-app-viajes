import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

// El selector devuelve archivos temporales; se copian al almacenamiento de la app para que no desaparezcan
async function persist(uri: string): Promise<string> {
  if (Platform.OS === 'web') return uri;
  const extension = uri.split('?')[0].split('.').pop() || 'jpg';
  const destination = new File(Paths.document, `diary-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`);
  await new File(uri).copy(destination);
  return destination.uri;
}

export async function pickPhotos(source: 'library' | 'camera'): Promise<string[]> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.7,
    ...(source === 'library' ? { allowsMultipleSelection: true, selectionLimit: 6 } : {}),
  };

  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return [];
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return [];
  return Promise.all(result.assets.map((asset) => persist(asset.uri)));
}
