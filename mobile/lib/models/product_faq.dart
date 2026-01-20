import 'package:cloud_firestore/cloud_firestore.dart';

class ProductFAQ {
  final String id;
  final String question;
  final String answer;
  final int displayOrder;
  final bool isActive;

  ProductFAQ({
    required this.id,
    required this.question,
    required this.answer,
    required this.displayOrder,
    required this.isActive,
  });

  factory ProductFAQ.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return ProductFAQ(
      id: doc.id,
      question: data['question'] ?? '',
      answer: data['answer'] ?? '',
      displayOrder: data['displayOrder'] ?? 0,
      isActive: data['isActive'] ?? true,
    );
  }
}
