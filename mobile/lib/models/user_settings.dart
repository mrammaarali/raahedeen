import 'package:cloud_firestore/cloud_firestore.dart';

class UserSettings {
  final String uid;
  final String language;
  final bool notifyQuran;
  final bool notifyProducts;
  final bool notifyReminders;

  UserSettings({
    required this.uid,
    this.language = 'EN',
    this.notifyQuran = true,
    this.notifyProducts = true,
    this.notifyReminders = true,
  });

  factory UserSettings.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return UserSettings(
      uid: doc.id,
      language: data['language'] ?? 'EN',
      notifyQuran: data['notifyQuran'] ?? true,
      notifyProducts: data['notifyProducts'] ?? true,
      notifyReminders: data['notifyReminders'] ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'language': language,
      'notifyQuran': notifyQuran,
      'notifyProducts': notifyProducts,
      'notifyReminders': notifyReminders,
    };
  }
}
