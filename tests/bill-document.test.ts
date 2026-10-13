import {seed} from './fixtures.mjs';
import {it,expect} from 'vitest';
import {issueSale,stock} from '../src/domain';
import {bahtWords} from '../src/bill-document';
const details={sellerName:'ร้านตัวอย่าง',sellerAddress:'ที่อยู่จำลอง',sellerTaxId:'',buyerName:'ลูกค้าตัวอย่าง',buyerAddress:'',buyerTaxId:'',bookNumber:'1',receiverName:''};
it('issues one confirmed bill without persisting an intermediate draft',()=>{const s=issueSale(seed(),'one',[{productId:'a',quantity:3,price:18000}],details);expect(s.sales).toHaveLength(1);expect(s.sales[0].status).toBe('confirmed');expect(stock(s,'a')).toBe(9);expect(s.sales[0].document.buyerName).toBe('ลูกค้าตัวอย่าง')});
it('issue retry cannot deduct twice or change the first saved document',()=>{const s=issueSale(seed(),'one',[{productId:'a',quantity:3,price:18000}],details);const retry=issueSale(s,'one',[{productId:'a',quantity:4,price:18000}],{...details,buyerName:'อื่น'});expect(stock(retry,'a')).toBe(9);expect(retry.sales[0].document.buyerName).toBe('ลูกค้าตัวอย่าง')});
it('insufficient inventory never leaves a draft behind when issuing directly',()=>{const s=seed();expect(()=>issueSale(s,'one',[{productId:'c',quantity:1,price:20000}],details)).toThrow(/คงเหลือ/);expect(s.sales).toHaveLength(0)});
it.each([[0,'ศูนย์บาทถ้วน'],[54000,'ห้าร้อยสี่สิบบาทถ้วน'],[66175,'หกร้อยหกสิบเอ็ดบาทเจ็ดสิบห้าสตางค์'],[2100,'ยี่สิบเอ็ดบาทถ้วน'],[10100,'หนึ่งร้อยเอ็ดบาทถ้วน'],[100000100,'หนึ่งล้านหนึ่งบาทถ้วน']])('amount %s has correct written baht', (n,text)=>expect(bahtWords(n as number)).toBe(text));
