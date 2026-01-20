import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/finder_rule.dart';
import 'finder_results_screen.dart';

class FinderScreen extends StatefulWidget {
  const FinderScreen({super.key});

  @override
  State<FinderScreen> createState() => _FinderScreenState();
}

class _FinderScreenState extends State<FinderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _cityController = TextEditingController();
  DateTime? _selectedDate;
  String? _selectedGender;
  bool _isLoading = false;

  int _calculateNameNumber(String name) {
    int sum = name
        .toUpperCase()
        .replaceAll(RegExp(r'[^A-Z]'), '')
        .runes
        .map((r) => r - 64)
        .reduce((a, b) => a + b);
    return _reduceToSingleDigit(sum);
  }

  int _calculateDobNumber(DateTime dob) {
    int sum = dob.day.toString().runes.map((r) => int.parse(String.fromCharCode(r))).reduce((a, b) => a + b) +
              dob.month.toString().runes.map((r) => int.parse(String.fromCharCode(r))).reduce((a, b) => a + b) +
              dob.year.toString().runes.map((r) => int.parse(String.fromCharCode(r))).reduce((a, b) => a + b);
    return _reduceToSingleDigit(sum);
  }

  int _reduceToSingleDigit(int number) {
    while (number > 9) {
      number = number.toString().runes.map((r) => int.parse(String.fromCharCode(r))).reduce((a, b) => a + b);
    }
    return number;
  }

  Future<void> _findMyStone() async {
    if (!_formKey.currentState!.validate() || _selectedDate == null || _selectedGender == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final nameNumber = _calculateNameNumber(_nameController.text);
      final dobNumber = _calculateDobNumber(_selectedDate!);

      final rulesQuery = await FirebaseFirestore.instance
          .collection('finderRules')
          .where('nameNumber', isEqualTo: nameNumber)
          .where('dobNumber', isEqualTo: dobNumber)
          .limit(1)
          .get();

      FinderRule? rule;
      if (rulesQuery.docs.isNotEmpty) {
        rule = FinderRule.fromFirestore(rulesQuery.docs.first);
      }

      // Save the request
      await FirebaseFirestore.instance.collection('gemstoneRequests').add({
        'name': _nameController.text,
        'dob': _selectedDate!.toIso8601String().split('T').first,
        'city': _cityController.text,
        'gender': _selectedGender,
        'recommendedGemstone': rule?.primaryGemstone ?? 'Not Found',
        'createdAt': FieldValue.serverTimestamp(),
        'uid': FirebaseAuth.instance.currentUser?.uid, // Optional: track user
      });

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => FinderResultsScreen(rule: rule),
        ),
      );

    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('An error occurred: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full Name'),
              validator: (value) => value!.isEmpty ? 'Please enter your name' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _cityController,
              decoration: const InputDecoration(labelText: 'City'),
              validator: (value) => value!.isEmpty ? 'Please enter your city' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedGender,
              decoration: const InputDecoration(labelText: 'Gender'),
              items: ['Male', 'Female', 'Other'].map((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
              onChanged: (newValue) => setState(() => _selectedGender = newValue),
              validator: (value) => value == null ? 'Please select a gender' : null,
            ),
            const SizedBox(height: 16),
            ListTile(
              title: Text(_selectedDate == null
                  ? 'Select Date of Birth'
                  : 'DOB: ${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'),
              trailing: const Icon(Icons.calendar_today),
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime(1900),
                  lastDate: DateTime.now(),
                );
                if (date != null) {
                  setState(() => _selectedDate = date);
                }
              },
            ),
            const SizedBox(height: 32),
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _findMyStone,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: Theme.of(context).primaryColor,
                    ),
                    child: const Text('Find My Stone', style: TextStyle(fontSize: 18, color: Colors.black)),
                  ),
          ],
        ),
      ),
    );
  }
}
