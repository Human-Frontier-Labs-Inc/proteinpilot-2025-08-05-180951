# HIPAA Compliance Requirements for ProteinPilot

## Overview
ProteinPilot will handle Protected Health Information (PHI) including dietary data, health goals, and potentially medical dietary requirements. This document outlines the technical and administrative requirements for HIPAA compliance.

## Key HIPAA Rules Applicable to ProteinPilot

### 1. Privacy Rule
- Users must have control over their health information
- Clear privacy policies and consent mechanisms
- Ability to request copies of their data
- Right to request corrections to their data

### 2. Security Rule
- Administrative, physical, and technical safeguards
- Access controls and audit logs
- Encryption of PHI at rest and in transit
- Regular security assessments

### 3. Breach Notification Rule
- Procedures for detecting and reporting breaches
- User notification within 60 days
- Documentation of all incidents

## Technical Requirements

### 1. Access Control (§164.312(a))
```typescript
// Implementation requirements:
- Unique user identification (Clerk user IDs)
- Automatic logoff after inactivity (implement 15-minute timeout)
- Encryption and decryption of PHI
```

**Current Status**: ✅ Clerk provides unique user IDs
**To Implement**: 
- Session timeout mechanism
- Role-based access control
- Data encryption layer

### 2. Audit Controls (§164.312(b))
```typescript
// Audit log requirements:
interface AuditLog {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure';
}
```

**To Implement**:
- Comprehensive audit logging system
- Log retention for 6 years
- Regular audit log reviews

### 3. Integrity Controls (§164.312(c))
```typescript
// Data integrity requirements:
- Implement checksums for critical data
- Version control for data modifications
- Backup and recovery procedures
```

### 4. Transmission Security (§164.312(e))
**Current Status**: ✅ HTTPS enforced by Next.js
**To Implement**:
- End-to-end encryption for sensitive data
- Secure API communication protocols
- VPN requirements for administrative access

### 5. Encryption Requirements
```typescript
// Encryption standards:
- AES-256 for data at rest
- TLS 1.2+ for data in transit
- Encrypted database fields for PHI
```

## Database Schema Modifications for HIPAA

```prisma
// Add to schema.prisma

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String
  resource    String
  resourceId  String
  timestamp   DateTime @default(now())
  ipAddress   String
  userAgent   String
  outcome     String
  
  @@index([userId])
  @@index([timestamp])
}

model UserConsent {
  id          String   @id @default(cuid())
  userId      String   @unique
  privacyPolicy Boolean @default(false)
  dataSharing Boolean @default(false)
  marketing   Boolean @default(false)
  consentDate DateTime @default(now())
  ipAddress   String
}

model DataRetention {
  id          String   @id @default(cuid())
  userId      String
  dataType    String
  retentionDate DateTime
  reason      String
}
```

## Administrative Requirements

### 1. Business Associate Agreements (BAAs)
Required with:
- Clerk (authentication)
- Supabase/Database provider
- Stripe (if processing health-related payments)
- Any food recognition API provider
- Grocery delivery partners

### 2. Policies and Procedures
Document and implement:
- Privacy practices notice
- Information access management
- Workforce training program
- Incident response plan
- Data backup and recovery plan

### 3. Risk Assessment
Conduct and document:
- Initial security risk assessment
- Annual reviews
- Vulnerability assessments
- Penetration testing

## Implementation Checklist

### Phase 1: Core Security (Week 1-2)
- [ ] Implement session timeout (15 minutes)
- [ ] Add audit logging to all PHI access
- [ ] Encrypt sensitive database fields
- [ ] Create privacy policy and consent flows

### Phase 2: Access Controls (Week 3)
- [ ] Implement role-based access control
- [ ] Add data access request workflow
- [ ] Create data export functionality
- [ ] Implement account deletion with data purge

### Phase 3: Monitoring & Compliance (Week 4)
- [ ] Set up security monitoring
- [ ] Create breach notification system
- [ ] Implement backup and recovery
- [ ] Document all procedures

## Code Implementation Examples

### 1. Session Timeout Middleware
```typescript
// middleware/sessionTimeout.ts
export function sessionTimeout(maxInactiveMinutes = 15) {
  return async (req, res, next) => {
    const lastActivity = req.session.lastActivity;
    const now = Date.now();
    
    if (lastActivity && (now - lastActivity) > maxInactiveMinutes * 60 * 1000) {
      req.session.destroy();
      return res.redirect('/sign-in?reason=timeout');
    }
    
    req.session.lastActivity = now;
    next();
  };
}
```

### 2. Audit Logging Helper
```typescript
// lib/audit.ts
export async function logAccess({
  userId,
  action,
  resource,
  resourceId,
  outcome = 'success'
}: AuditLogEntry) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      resourceId,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      outcome
    }
  });
}
```

### 3. Data Encryption Helper
```typescript
// lib/encryption.ts
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

## Compliance Monitoring

### Regular Audits
- Monthly: Review access logs
- Quarterly: Security assessment
- Annually: Full HIPAA audit
- As needed: Incident response

### Key Metrics to Track
- Failed login attempts
- Data access patterns
- Session timeout rates
- Encryption coverage
- Backup success rates

## Third-Party Service Requirements

### Required BAAs and Security Features:
1. **Clerk**: Ensure BAA is signed, use secure sessions
2. **Database Provider**: Encrypted connections, encrypted backups
3. **Food Recognition API**: PHI handling agreement, data retention limits
4. **Grocery Partners**: Limited data sharing, no PHI transmission

## Conclusion

HIPAA compliance for ProteinPilot requires significant security enhancements to the base template. The most critical implementations are:

1. Comprehensive audit logging
2. Session timeout mechanism
3. Data encryption for PHI
4. Consent management system
5. Secure backup and recovery

These features should be implemented incrementally, with security testing at each phase.