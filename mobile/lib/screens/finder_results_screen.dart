import 'package:flutter/material.dart';
import '../models/finder_rule.dart';

class FinderResultsScreen extends StatelessWidget {
  final FinderRule? rule;

  const FinderResultsScreen({super.key, this.rule});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Gemstone Recommendation'),
        backgroundColor: const Color(0xFF1F1F1F),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: rule != null
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Primary Gemstone:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text(rule!.primaryGemstone, style: const TextStyle(fontSize: 24, color: Colors.amber)),
                  const SizedBox(height: 16),
                  const Text('Secondary Gemstone:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text(rule!.secondaryGemstone, style: const TextStyle(fontSize: 22, color: Colors.grey)),
                  const SizedBox(height: 24),
                  const Text('Explanation:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text(rule!.explanation, style: const TextStyle(fontSize: 16)),
                  const SizedBox(height: 24),
                  const Divider(),
                  const Text('Disclaimer:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  Text(rule!.disclaimer, style: const TextStyle(fontSize: 14, fontStyle: FontStyle.italic, color: Colors.grey)),
                ],
              )
            : const Center(
                child: Text(
                  'Sorry, no specific recommendation was found based on your details. Please check back later or contact us for a manual consultation.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16),
                ),
              ),
      ),
    );
  }
}
