import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/dua.dart';

class DuasScreen extends StatelessWidget {
  const DuasScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('duas')
          .where('isActive', isEqualTo: true)
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return const Center(child: Text('Error fetching duas.'));
        }

        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          return const Center(child: Text('No duas available.'));
        }

        final duas = snapshot.data!.docs
            .map((doc) => Dua.fromFirestore(doc))
            .toList();

        // Group duas by category
        final Map<String, List<Dua>> groupedDuas = {};
        for (var dua in duas) {
          if (groupedDuas.containsKey(dua.category)) {
            groupedDuas[dua.category]!.add(dua);
          } else {
            groupedDuas[dua.category] = [dua];
          }
        }

        final categories = groupedDuas.keys.toList();

        return ListView.builder(
          itemCount: categories.length,
          itemBuilder: (context, index) {
            final category = categories[index];
            final categoryDuas = groupedDuas[category]!;

            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              color: const Color(0xFF1F1F1F),
              child: ExpansionTile(
                title: Text(category, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                children: categoryDuas.map((dua) => _buildDuaTile(dua)).toList(),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildDuaTile(Dua dua) {
    return ExpansionTile(
      title: Text(dua.title, style: const TextStyle(color: Colors.white70)),
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(dua.arabic, style: const TextStyle(fontSize: 20, color: Colors.white), textAlign: TextAlign.right, textDirection: TextDirection.rtl),
              const SizedBox(height: 16),
              const Text('Transliteration:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
              Text(dua.transliteration, style: const TextStyle(fontStyle: FontStyle.italic, color: Colors.white70)),
              const SizedBox(height: 16),
              const Text('Meaning:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
              Text(dua.meaning, style: const TextStyle(color: Colors.white70)),
            ],
          ),
        ),
      ],
    );
  }
}
