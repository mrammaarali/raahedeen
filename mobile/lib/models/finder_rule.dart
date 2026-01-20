import 'package:cloud_firestore/cloud_firestore.dart';

class FinderRule {
  final String id;
  final int nameNumber;
  final int dobNumber;
  final String primaryGemstone;
  final String secondaryGemstone;
  final String explanation;
  final String disclaimer;

  FinderRule({
    required this.id,
    required this.nameNumber,
    required this.dobNumber,
    required this.primaryGemstone,
    required this.secondaryGemstone,
    required this.explanation,
    required this.disclaimer,
  });

  factory FinderRule.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return FinderRule(
      id: doc.id,
      nameNumber: data['nameNumber'] ?? 0,
      dobNumber: data['dobNumber'] ?? 0,
      primaryGemstone: data['primaryGemstone'] ?? '',
      secondaryGemstone: data['secondaryGemstone'] ?? '',
      explanation: data['explanation'] ?? '',
      disclaimer: data['disclaimer'] ?? '',
    );
  }
}
