import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_settings.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late Future<UserSettings> _settingsFuture;
  final String _uid = FirebaseAuth.instance.currentUser!.uid;

  @override
  void initState() {
    super.initState();
    _settingsFuture = _fetchUserSettings();
  }

  Future<UserSettings> _fetchUserSettings() async {
    final docRef = FirebaseFirestore.instance.collection('user_settings').doc(_uid);
    final docSnap = await docRef.get();
    if (docSnap.exists) {
      return UserSettings.fromFirestore(docSnap);
    } else {
      // Create default settings if they don't exist
      final defaultSettings = UserSettings(uid: _uid);
      await docRef.set(defaultSettings.toMap());
      return defaultSettings;
    }
  }

  Future<void> _updateSetting(Map<String, dynamic> data) async {
    await FirebaseFirestore.instance.collection('user_settings').doc(_uid).update(data);
    // Refresh the UI
    setState(() {
      _settingsFuture = _fetchUserSettings();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<UserSettings>(
      future: _settingsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return const Center(child: Text('Error loading settings.'));
        }

        if (!snapshot.hasData) {
          return const Center(child: Text('Could not load settings.'));
        }

        final settings = snapshot.data!;

        return ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            _buildLanguageSetting(settings),
            const Divider(height: 32),
            _buildNotificationSetting('Quran Recitations', settings.notifyQuran, 'notifyQuran'),
            _buildNotificationSetting('New Products', settings.notifyProducts, 'notifyProducts'),
            _buildNotificationSetting('Reminders', settings.notifyReminders, 'notifyReminders'),
          ],
        );
      },
    );
  }

  Widget _buildLanguageSetting(UserSettings settings) {
    return ListTile(
      title: const Text('App Language'),
      trailing: DropdownButton<String>(
        value: settings.language,
        items: ['EN', 'HI', 'UR', 'AR'].map((String value) {
          return DropdownMenuItem<String>(
            value: value,
            child: Text(value),
          );
        }).toList(),
        onChanged: (newValue) {
          if (newValue != null) {
            _updateSetting({'language': newValue});
          }
        },
      ),
    );
  }

  Widget _buildNotificationSetting(String title, bool value, String key) {
    return SwitchListTile(
      title: Text(title),
      value: value,
      onChanged: (newValue) {
        _updateSetting({key: newValue});
      },
      activeColor: Theme.of(context).primaryColor,
    );
  }
}
